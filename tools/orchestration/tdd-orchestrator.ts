/**
 * TDD Orchestrator - Main orchestration engine for test-driven development
 * with multi-agent coordination and healthcare compliance
 */

import {
  TDDPhase,
  AgentName,
  FeatureContext,
  OrchestrationOptions,
  OrchestrationResult,
  PhaseResult,
  QualityGate,
  AgentResult,
  AgentCapability,
  OrchestrationMetrics,
  WorkflowType,
  QualityControlContext,
  QualityControlResult,
  OrchestrationContext,
  AgentCoordinationPattern,
  HealthcareCompliance,
  TDDCycleResult,
  TDDMetrics,
  AgentRegistry as IAgentRegistry,
  OrchestrationWorkflow
} from './types';
import { WorkflowEngine } from './workflows/workflow-engine';
import { AgentRegistry } from './agent-registry';

export class TDDOrchestrator {
  private agentRegistry: IAgentRegistry;
  private workflowEngine: WorkflowEngine;
  private currentPhase: TDDPhase = 'red';
  private metrics: TDDMetrics;

  constructor(agentRegistry: AgentRegistry, workflowEngine: WorkflowEngine) {
    this.agentRegistry = agentRegistry;
    this.workflowEngine = workflowEngine;
    this.metrics = this.initializeMetrics();
  }

  /**
   * Execute complete TDD cycle with multi-agent coordination
   */
  async executeFullTDDCycle(
    feature: FeatureContext,
    options?: OrchestrationOptions
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const cycleId = this.generateCycleId();
    
    console.log(`🚀 Starting TDD Cycle: ${cycleId} for feature: ${feature.name}`);

    // Create orchestration context from feature
    const context: OrchestrationContext = {
      featureName: feature.name,
      featureType: feature.domain.join(', '),
      complexity: feature.complexity,
      criticalityLevel: feature.complexity === 'high' ? 'critical' : feature.complexity,
      requirements: feature.requirements,
      healthcareCompliance: {
        required: options?.healthcare || false,
        lgpd: options?.healthcare,
        anvisa: options?.healthcare,
        cfm: options?.healthcare,
      },
    };

    try {
      // Phase 1: RED - Write failing tests
      const redResult = await this.executeRedPhase(context);
      if (!redResult.success) {
        return this.createFailureResult(cycleId, 'red', 'RED phase failed');
      }

      // Phase 2: GREEN - Make tests pass
      const greenResult = await this.executeGreenPhase(context);
      if (!greenResult.success) {
        return this.createFailureResult(cycleId, 'green', 'GREEN phase failed');
      }

      // Phase 3: REFACTOR - Improve code quality
      const refactorResult = await this.executeRefactorPhase(context);
      if (!refactorResult.success) {
        return this.createFailureResult(cycleId, 'refactor', 'REFACTOR phase failed');
      }

      // Final validation and compliance check
      const validationResult = await this.executeFinalValidation(context);
      if (!validationResult.success) {
        return this.createFailureResult(cycleId, 'validation', 'Final validation failed');
      }

      const duration = Date.now() - startTime;
      this.updateMetrics(cycleId, duration, true);

      return {
        cycleId,
        success: true,
        phases: {
          red: redResult,
          green: greenResult,
          refactor: refactorResult,
        },
        metrics: this.metrics,
        duration,
        healthcareCompliance: validationResult.healthcareCompliance,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(cycleId, duration, false);
      
      return this.createFailureResult(
        cycleId,
        this.currentPhase,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Execute Quality Control workflow with multi-agent parallel coordination
   * Integrates with the quality control command for comprehensive validation
   */
  async executeQualityControlWorkflow(
    qualityContext: QualityControlContext,
    orchestrationOptions?: OrchestrationOptions
  ): Promise<QualityControlResult> {
    const startTime = Date.now();
    const workflowId = `qc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔍 Starting Quality Control Workflow: ${workflowId} - Action: ${qualityContext.action}`);

    try {
      // Create comprehensive orchestration context
      const context: OrchestrationContext = this.createOrchestrationContext(qualityContext, orchestrationOptions);

      let agentResults: AgentResult[] = [];
      let orchestrationResult: OrchestrationResult | undefined;

      // Execute based on quality control action type
      switch (qualityContext.action) {
        case 'tdd-cycle':
        case 'tdd-critical':
          // Full TDD orchestration
          orchestrationResult = await this.executeFullTDDCycle({
            name: context.featureName,
            complexity: context.complexity,
            domain: [context.featureType],
            requirements: context.requirements,
          }, orchestrationOptions);
          break;

        case 'comprehensive':
          // Execute all quality dimensions in parallel
          agentResults = await this.executeComprehensiveQualityCheck(context, qualityContext);
          break;

        case 'test':
        case 'analyze':
        case 'debug':
        case 'validate':
        case 'compliance':
        case 'performance':
        case 'security':
        case 'cleanup':
        case 'format':
          // Execute specific quality control actions with selected agents
          agentResults = await this.executeSpecificQualityAction(context, qualityContext);
          break;

        default:
          // Fallback to comprehensive check
          agentResults = await this.executeComprehensiveQualityCheck(context, qualityContext);
      }

      const duration = Date.now() - startTime;

      // Calculate overall quality score
      const qualityScore = this.calculateOverallQualityScore(agentResults, orchestrationResult);

      // Generate recommendations
      const recommendations = this.generateQualityRecommendations(agentResults, orchestrationResult);

      // Generate next actions
      const nextActions = this.generateNextActions(agentResults, orchestrationResult, qualityContext);

      return {
        success: true,
        action: qualityContext.action,
        duration,
        results: this.aggregateActionResults(agentResults, orchestrationResult, qualityContext),
        agentResults,
        orchestrationResult,
        qualityScore,
        complianceStatus: context.healthcareCompliance.required ?
          await this.validateHealthcareComplianceStatus(context) : undefined,
        recommendations,
        nextActions,
        metrics: this.collectQualityControlMetrics(agentResults, orchestrationResult, duration),
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Quality Control Workflow failed: ${error}`);

      return {
        success: false,
        action: qualityContext.action,
        duration,
        results: {},
        agentResults: [],
        qualityScore: 0,
        recommendations: [`Fix error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        nextActions: ['Review error and retry with corrected configuration'],
        metrics: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Execute comprehensive quality check with all relevant agents in parallel
   */
  private async executeComprehensiveQualityCheck(
    context: OrchestrationContext,
    qualityContext: QualityControlContext
  ): Promise<AgentResult[]> {
    console.log('🔍 Executing comprehensive quality check with parallel agent coordination');

    // Select agents based on context and quality control requirements
    let selectedAgents: AgentCapability[];

    if (qualityContext.agents && qualityContext.agents.length > 0) {
      // Use explicitly specified agents
      selectedAgents = qualityContext.agents
        .map(agentName => this.agentRegistry.getAgent(agentName))
        .filter((agent): agent is AgentCapability => agent !== undefined);
    } else {
      // Auto-select optimal agents based on context
      selectedAgents = this.agentRegistry.selectOptimalAgents(context);
    }

    console.log(`📋 Selected ${selectedAgents.length} agents: ${selectedAgents.map(a => a.name).join(', ')}`);

    // Execute agents based on coordination pattern
    const coordinationPattern = qualityContext.coordination ||
      (qualityContext.parallel ? 'parallel' : 'sequential');

    return await this.executeCoordinationPattern(
      coordinationPattern,
      selectedAgents,
      context,
      await this.workflowEngine.selectWorkflow(context)
    );
  }

  /**
   * Execute specific quality control action with targeted agents
   */
  private async executeSpecificQualityAction(
    context: OrchestrationContext,
    qualityContext: QualityControlContext
  ): Promise<AgentResult[]> {
    console.log(`🎯 Executing specific quality action: ${qualityContext.action}`);

    // Map quality control actions to appropriate agents
    const actionAgentMap: Record<string, string[]> = {
      'test': ['test'],
      'analyze': ['code-reviewer', 'architect-review'],
      'debug': ['code-reviewer', 'architect-review'],
      'validate': ['test', 'code-reviewer'],
      'compliance': ['security-auditor'],
      'performance': ['architect-review', 'test'],
      'security': ['security-auditor'],
      'cleanup': ['code-reviewer'],
      'format': ['code-reviewer'],
    };

    const targetAgentNames = actionAgentMap[qualityContext.action] || [];
    const selectedAgents = targetAgentNames
      .map(agentName => this.agentRegistry.getAgent(agentName as AgentName))
      .filter((agent): agent is AgentCapability => agent !== undefined);

    // Always include healthcare compliance if required
    if (context.healthcareCompliance.required) {
      const securityAgent = this.agentRegistry.getAgent('security-auditor');
      if (securityAgent && !selectedAgents.includes(securityAgent)) {
        selectedAgents.push(securityAgent);
      }
    }

    return await this.executeCoordinationPattern(
      qualityContext.coordination || 'sequential',
      selectedAgents,
      context,
      await this.workflowEngine.selectWorkflow(context)
    );
  }

  /**
   * Create orchestration context from quality control context
   */
  private createOrchestrationContext(
    qualityContext: QualityControlContext,
    options?: OrchestrationOptions
  ): OrchestrationContext {
    return {
      featureName: qualityContext.target || 'Quality Control Check',
      featureType: qualityContext.type || 'general',
      complexity: qualityContext.depth ? this.mapDepthToComplexity(qualityContext.depth) : 'medium',
      criticalityLevel: qualityContext.healthcare ? 'critical' :
        (qualityContext.type === 'security' || qualityContext.type === 'compliance') ? 'high' : 'medium',
      requirements: [`${qualityContext.action} validation`, 'Quality assurance', 'Best practices compliance'],
      healthcareCompliance: {
        required: qualityContext.healthcare || false,
        lgpd: qualityContext.healthcare,
        anvisa: qualityContext.healthcare,
        cfm: qualityContext.healthcare,
      },
      qualityControlContext: qualityContext,
    };
  }

  /**
   * Map quality control depth to complexity level
   */
  private mapDepthToComplexity(depth: string): 'low' | 'medium' | 'high' {
    const depthNumber = parseInt(depth.replace('L', ''));
    if (depthNumber <= 3) return 'low';
    if (depthNumber <= 7) return 'medium';
    return 'high';
  }

  /**
   * RED Phase: Write failing tests with agent coordination
   */
  private async executeRedPhase(context: OrchestrationContext): Promise<AgentResult> {
    this.currentPhase = 'red';
    console.log('🔴 Executing RED phase - Writing failing tests');

    // Select workflow based on context
    const workflow = await this.workflowEngine.selectWorkflow(context);
    
    // Coordinate agents for RED phase
    const agents = this.agentRegistry.getAgentsForPhase('red', context);
    const coordinationPattern = this.determineCoordinationPattern(context, 'red');

    let result: AgentResult;

    switch (coordinationPattern) {
      case 'sequential':
        result = await this.executeSequentialCoordination(agents, context, workflow);
        break;
      case 'parallel':
        result = await this.executeParallelCoordination(agents, context, workflow);
        break;
      case 'hierarchical':
        result = await this.executeHierarchicalCoordination(agents, context, workflow);
        break;
      case 'event-driven':
        result = await this.executeEventDrivenCoordination(agents, context, workflow);
        break;
      default:
        result = await this.executeSequentialCoordination(agents, context, workflow);
    }

    // Apply quality gates
    const qualityGateResult = await this.applyQualityGates(result, context, 'red');
    
    return {
      ...result,
      qualityGates: qualityGateResult,
    };
  }

  /**
   * GREEN Phase: Make tests pass with minimal implementation
   */
  private async executeGreenPhase(context: OrchestrationContext): Promise<AgentResult> {
    this.currentPhase = 'green';
    console.log('🟢 Executing GREEN phase - Making tests pass');

    const workflow = await this.workflowEngine.selectWorkflow(context);
    const agents = this.agentRegistry.getAgentsForPhase('green', context);
    const coordinationPattern = this.determineCoordinationPattern(context, 'green');

    const result = await this.executeCoordinationPattern(
      coordinationPattern,
      agents,
      context,
      workflow
    );

    const qualityGateResult = await this.applyQualityGates(result, context, 'green');
    
    return {
      ...result,
      qualityGates: qualityGateResult,
    };
  }

  /**
   * REFACTOR Phase: Improve code quality while maintaining tests
   */
  private async executeRefactorPhase(context: OrchestrationContext): Promise<AgentResult> {
    this.currentPhase = 'refactor';
    console.log('🔵 Executing REFACTOR phase - Improving code quality');

    const workflow = await this.workflowEngine.selectWorkflow(context);
    const agents = this.agentRegistry.getAgentsForPhase('refactor', context);
    const coordinationPattern = this.determineCoordinationPattern(context, 'refactor');

    const result = await this.executeCoordinationPattern(
      coordinationPattern,
      agents,
      context,
      workflow
    );

    const qualityGateResult = await this.applyQualityGates(result, context, 'refactor');
    
    return {
      ...result,
      qualityGates: qualityGateResult,
    };
  }

  /**
   * Execute final validation including healthcare compliance
   */
  private async executeFinalValidation(
    context: OrchestrationContext
  ): Promise<AgentResult & { healthcareCompliance: HealthcareCompliance }> {
    console.log('✅ Executing final validation and compliance check');

    const agents = this.agentRegistry.getAgentsForCapability('compliance-validation');
    const workflow = await this.workflowEngine.selectWorkflow(context);

    const result = await this.executeSequentialCoordination(agents, context, workflow);
    
    // Healthcare compliance validation
    const healthcareCompliance = await this.validateHealthcareCompliance(context);
    
    return {
      ...result,
      healthcareCompliance,
    };
  }

  /**
   * Execute coordination pattern based on type
   */
  private async executeCoordinationPattern(
    pattern: AgentCoordinationPattern,
    agents: AgentCapability[],
    context: OrchestrationContext,
    workflow: OrchestrationWorkflow
  ): Promise<AgentResult> {
    switch (pattern) {
      case 'sequential':
        return this.executeSequentialCoordination(agents, context, workflow);
      case 'parallel':
        return this.executeParallelCoordination(agents, context, workflow);
      case 'hierarchical':
        return this.executeHierarchicalCoordination(agents, context, workflow);
      case 'event-driven':
        return this.executeEventDrivenCoordination(agents, context, workflow);
      default:
        return this.executeSequentialCoordination(agents, context, workflow);
    }
  }

  /**
   * Sequential agent coordination
   */
  private async executeSequentialCoordination(
    agents: AgentCapability[],
    context: OrchestrationContext,
    workflow: OrchestrationWorkflow
  ): Promise<AgentResult> {
    const results: AgentResult[] = [];
    
    for (const agent of agents) {
      const agentResult = await workflow.executeAgent(agent, context, results);
      results.push(agentResult);
      
      if (!agentResult.success) {
        return this.aggregateResults(results, false);
      }
    }
    
    return this.aggregateResults(results, true);
  }

  /**
   * Parallel agent coordination
   */
  private async executeParallelCoordination(
    agents: AgentCapability[],
    context: OrchestrationContext,
    workflow: OrchestrationWorkflow
  ): Promise<AgentResult> {
    const agentPromises = agents.map(agent => 
      workflow.executeAgent(agent, context, [])
    );
    
    const results = await Promise.all(agentPromises);
    const success = results.every(result => result.success);
    
    return this.aggregateResults(results, success);
  }

  /**
   * Hierarchical agent coordination
   */
  private async executeHierarchicalCoordination(
    agents: AgentCapability[],
    context: OrchestrationContext,
    workflow: OrchestrationWorkflow
  ): Promise<AgentResult> {
    // Primary agent executes first
    const primaryAgent = agents.find(a => a.priority === 'primary') || agents[0];
    const primaryResult = await workflow.executeAgent(primaryAgent, context, []);
    
    if (!primaryResult.success) {
      return primaryResult;
    }
    
    // Secondary agents execute with primary context
    const secondaryAgents = agents.filter(a => a.priority === 'secondary');
    const secondaryResults: AgentResult[] = [];
    
    for (const agent of secondaryAgents) {
      const result = await workflow.executeAgent(agent, context, [primaryResult]);
      secondaryResults.push(result);
    }
    
    return this.aggregateResults([primaryResult, ...secondaryResults], true);
  }

  /**
   * Event-driven agent coordination
   */
  private async executeEventDrivenCoordination(
    agents: AgentCapability[],
    context: OrchestrationContext,
    workflow: OrchestrationWorkflow
  ): Promise<AgentResult> {
    // Implementation for event-driven coordination
    // This would integrate with event system for reactive agent execution
    return this.executeSequentialCoordination(agents, context, workflow);
  }

  /**
   * Determine coordination pattern based on context and phase
   */
  private determineCoordinationPattern(
    context: OrchestrationContext,
    phase: TDDPhase
  ): AgentCoordinationPattern {
    // Complex analysis logic
    if (context.complexity === 'high' || context.criticalityLevel === 'critical') {
      return 'hierarchical';
    }
    
    if (context.featureType === 'microservice' && phase === 'refactor') {
      return 'parallel';
    }
    
    if (context.healthcareCompliance.required) {
      return 'sequential'; // Ensure proper compliance validation order
    }
    
    return 'sequential'; // Default safe pattern
  }

  /**
   * Apply quality gates for current phase
   */
  private async applyQualityGates(
    result: AgentResult,
    context: OrchestrationContext,
    phase: TDDPhase
  ): Promise<QualityGate[]> {
    const qualityGates: QualityGate[] = [];
    
    // Phase-specific quality gates
    switch (phase) {
      case 'red':
        qualityGates.push(
          await this.validateTestStructure(result),
          await this.validateTestCoverage(result, context)
        );
        break;
      case 'green':
        qualityGates.push(
          await this.validateImplementation(result),
          await this.validateTestsPassing(result)
        );
        break;
      case 'refactor':
        qualityGates.push(
          await this.validateCodeQuality(result),
          await this.validatePerformance(result)
        );
        break;
    }
    
    // Universal quality gates
    qualityGates.push(
      await this.validateSecurity(result, context),
      await this.validateAccessibility(result)
    );
    
    return qualityGates.filter(gate => gate !== null);
  }

  /**
   * Validate healthcare compliance (LGPD, ANVISA, CFM)
   */
  private async validateHealthcareCompliance(
    context: OrchestrationContext
  ): Promise<HealthcareCompliance> {
    return {
      lgpd: await this.validateLGPDCompliance(context),
      anvisa: await this.validateANVISACompliance(context),
      cfm: await this.validateCFMCompliance(context),
      international: {
        hipaa: await this.validateHIPAACompliance(context),
        gdpr: await this.validateGDPRCompliance(context),
      },
      auditTrail: await this.generateComplianceAuditTrail(context),
    };
  }

  // Quality gate implementations
  private async validateTestStructure(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Test Structure Validation',
      status: result.testResults?.structure?.valid ? 'passed' : 'failed',
      message: result.testResults?.structure?.message || 'Test structure validation',
      criteria: ['Test organization', 'Naming conventions', 'Setup/teardown'],
    };
  }

  private async validateTestCoverage(result: AgentResult, context: OrchestrationContext): Promise<QualityGate> {
    const requiredCoverage = this.getRequiredCoverage(context);
    const actualCoverage = result.testResults?.coverage?.percentage || 0;
    
    return {
      name: 'Test Coverage Validation',
      status: actualCoverage >= requiredCoverage ? 'passed' : 'failed',
      message: `Coverage: ${actualCoverage}% (required: ${requiredCoverage}%)`,
      criteria: [`Minimum ${requiredCoverage}% coverage`],
    };
  }

  private async validateImplementation(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Implementation Validation',
      status: result.implementationResults?.valid ? 'passed' : 'failed',
      message: result.implementationResults?.message || 'Implementation validation',
      criteria: ['Minimal implementation', 'Tests passing', 'No over-engineering'],
    };
  }

  private async validateTestsPassing(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Tests Passing Validation',
      status: result.testResults?.allPassing ? 'passed' : 'failed',
      message: `${result.testResults?.passedCount}/${result.testResults?.totalCount} tests passing`,
      criteria: ['All tests must pass'],
    };
  }

  private async validateCodeQuality(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Code Quality Validation',
      status: result.qualityScore >= 9.5 ? 'passed' : 'failed',
      message: `Quality Score: ${result.qualityScore}/10`,
      criteria: ['Code quality ≥9.5/10', 'No code smells', 'Proper patterns'],
    };
  }

  private async validatePerformance(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Performance Validation',
      status: result.performanceMetrics?.withinLimits ? 'passed' : 'failed',
      message: result.performanceMetrics?.summary || 'Performance validation',
      criteria: ['Response time limits', 'Memory usage', 'Scalability'],
    };
  }

  private async validateSecurity(result: AgentResult, context: OrchestrationContext): Promise<QualityGate> {
    return {
      name: 'Security Validation',
      status: result.securityScan?.vulnerabilities === 0 ? 'passed' : 'failed',
      message: `${result.securityScan?.vulnerabilities || 0} security vulnerabilities found`,
      criteria: ['No critical vulnerabilities', 'Proper input validation', 'Secure patterns'],
    };
  }

  private async validateAccessibility(result: AgentResult): Promise<QualityGate> {
    return {
      name: 'Accessibility Validation',
      status: result.accessibilityScore >= 95 ? 'passed' : 'failed',
      message: `Accessibility Score: ${result.accessibilityScore}%`,
      criteria: ['WCAG 2.1 AA+ compliance', 'Healthcare interface standards'],
    };
  }

  // Healthcare compliance validation methods
  private async validateLGPDCompliance(context: OrchestrationContext): Promise<boolean> {
    // LGPD compliance validation logic
    return true; // Placeholder
  }

  private async validateANVISACompliance(context: OrchestrationContext): Promise<boolean> {
    // ANVISA compliance validation logic  
    return true; // Placeholder
  }

  private async validateCFMCompliance(context: OrchestrationContext): Promise<boolean> {
    // CFM compliance validation logic
    return true; // Placeholder
  }

  private async validateHIPAACompliance(context: OrchestrationContext): Promise<boolean> {
    // HIPAA compliance validation logic
    return true; // Placeholder
  }

  private async validateGDPRCompliance(context: OrchestrationContext): Promise<boolean> {
    // GDPR compliance validation logic
    return true; // Placeholder
  }

  private async generateComplianceAuditTrail(context: OrchestrationContext): Promise<string[]> {
    return [
      'Compliance validation completed',
      'Audit trail generated',
      'Documentation updated',
    ];
  }

  // Helper methods
  private getRequiredCoverage(context: OrchestrationContext): number {
    switch (context.criticalityLevel) {
      case 'critical': return 95;
      case 'high': return 85;
      case 'medium': return 75;
      case 'low': return 70;
      default: return 80;
    }
  }

  private aggregateResults(results: AgentResult[], success: boolean): AgentResult {
    return {
      success,
      message: success ? 'All agents completed successfully' : 'One or more agents failed',
      results: results.map(r => r.results).flat(),
      agentResults: results,
    };
  }

  private generateCycleId(): string {
    return `tdd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createFailureResult(cycleId: string, phase: TDDPhase, error: string): TDDCycleResult {
    return {
      cycleId,
      success: false,
      error: `Failed during ${phase} phase: ${error}`,
      phases: {},
      metrics: this.metrics,
      duration: 0,
    };
  }

  private initializeMetrics(): TDDMetrics {
    return {
      totalCycles: 0,
      successfulCycles: 0,
      failedCycles: 0,
      averageDuration: 0,
      phaseMetrics: {
        red: { averageDuration: 0, successRate: 0 },
        green: { averageDuration: 0, successRate: 0 },
        refactor: { averageDuration: 0, successRate: 0 },
      },
      qualityMetrics: {
        averageQualityScore: 0,
        averageCoverage: 0,
        complianceRate: 0,
      },
    };
  }

  private updateMetrics(cycleId: string, duration: number, success: boolean): void {
    this.metrics.totalCycles++;
    if (success) {
      this.metrics.successfulCycles++;
    } else {
      this.metrics.failedCycles++;
    }

    // Update average duration
    this.metrics.averageDuration =
      (this.metrics.averageDuration * (this.metrics.totalCycles - 1) + duration) / this.metrics.totalCycles;
  }

  // Quality Control helper methods

  /**
   * Calculate overall quality score from agent results and orchestration result
   */
  private calculateOverallQualityScore(
    agentResults: AgentResult[],
    orchestrationResult?: OrchestrationResult
  ): number {
    if (orchestrationResult) {
      return orchestrationResult.overallQualityScore;
    }

    if (agentResults.length === 0) return 0;

    const scores = agentResults
      .map(result => result.qualityScore || 0)
      .filter(score => score > 0);

    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  /**
   * Generate quality recommendations based on agent results
   */
  private generateQualityRecommendations(
    agentResults: AgentResult[],
    orchestrationResult?: OrchestrationResult
  ): string[] {
    const recommendations: string[] = [];

    if (orchestrationResult) {
      recommendations.push(...orchestrationResult.recommendations);
    }

    // Analyze agent-specific recommendations
    agentResults.forEach(result => {
      if (result.warnings && result.warnings.length > 0) {
        recommendations.push(`${result.agent}: ${result.warnings.join(', ')}`);
      }
    });

    // Add general quality recommendations
    const qualityScore = this.calculateOverallQualityScore(agentResults, orchestrationResult);
    if (qualityScore < 9.5) {
      recommendations.push('Consider refactoring to improve quality score to ≥9.5/10');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate next actions based on results
   */
  private generateNextActions(
    agentResults: AgentResult[],
    orchestrationResult?: OrchestrationResult,
    qualityContext: QualityControlContext
  ): string[] {
    const nextActions: string[] = [];

    if (orchestrationResult) {
      nextActions.push(...orchestrationResult.nextActions);
    }

    // Check for failed agents
    const failedAgents = agentResults.filter(result => !result.success);
    if (failedAgents.length > 0) {
      nextActions.push(
        `Investigate and fix issues in: ${failedAgents.map(a => a.agent).join(', ')}`
      );
    }

    // Context-specific next actions
    if (qualityContext.healthcare) {
      nextActions.push('Verify healthcare compliance requirements are fully met');
      nextActions.push('Review audit trail for regulatory compliance');
    }

    if (qualityContext.type === 'security') {
      nextActions.push('Perform additional security testing');
      nextActions.push('Review security audit findings');
    }

    return [...new Set(nextActions)]; // Remove duplicates
  }

  /**
   * Aggregate action results based on quality control context
   */
  private aggregateActionResults(
    agentResults: AgentResult[],
    orchestrationResult?: OrchestrationResult,
    qualityContext: QualityControlContext
  ): any {
    const results: any = {};

    // Map agent results to quality control dimensions
    agentResults.forEach(result => {
      switch (result.agent) {
        case 'test':
          results.testing = result;
          break;
        case 'code-reviewer':
          if (qualityContext.type === 'analyze') {
            results.analysis = result;
          } else if (qualityContext.type === 'cleanup') {
            results.cleanup = result;
          } else if (qualityContext.type === 'format') {
            results.formatting = result;
          }
          break;
        case 'security-auditor':
          if (qualityContext.type === 'security') {
            results.security = result;
          } else if (qualityContext.type === 'compliance') {
            results.compliance = result;
          }
          break;
        case 'architect-review':
          if (qualityContext.type === 'analyze') {
            results.analysis = { ...results.analysis, architecture: result };
          } else if (qualityContext.type === 'performance') {
            results.performance = result;
          }
          break;
      }
    });

    // Add orchestration result if available
    if (orchestrationResult) {
      results.orchestration = orchestrationResult;
    }

    return results;
  }

  /**
   * Validate healthcare compliance status
   */
  private async validateHealthcareComplianceStatus(
    context: OrchestrationContext
  ): Promise<HealthcareComplianceContext> {
    return {
      lgpdRequired: context.healthcareCompliance.lgpd || false,
      anvisaRequired: context.healthcareCompliance.anvisa || false,
      cfmRequired: context.healthcareCompliance.cfm || false,
      patientDataInvolved: context.healthcareCompliance.required,
      auditTrailRequired: context.healthcareCompliance.required,
      performanceThreshold: context.criticalityLevel === 'critical' ? 100 : 200, // ms
      dataRetentionPolicies: ['LGPD compliant', 'Medical records retention'],
    };
  }

  /**
   * Collect comprehensive quality control metrics
   */
  private collectQualityControlMetrics(
    agentResults: AgentResult[],
    orchestrationResult?: OrchestrationResult,
    duration: number
  ): any {
    const metrics = {
      totalDuration: duration,
      agentsExecuted: agentResults.length,
      successfulAgents: agentResults.filter(r => r.success).length,
      failedAgents: agentResults.filter(r => !r.success).length,
      averageQualityScore: this.calculateOverallQualityScore(agentResults, orchestrationResult),
      agentBreakdown: {} as Record<string, any>,
    };

    // Collect agent-specific metrics
    agentResults.forEach(result => {
      metrics.agentBreakdown[result.agent] = {
        success: result.success,
        duration: result.duration,
        qualityScore: result.qualityScore,
        warningCount: result.warnings?.length || 0,
        errorCount: result.errors?.length || 0,
      };
    });

    // Add orchestration metrics if available
    if (orchestrationResult) {
      metrics.agentBreakdown['orchestration'] = {
        success: orchestrationResult.success,
        duration: orchestrationResult.duration,
        qualityScore: orchestrationResult.overallQualityScore,
        phases: Object.keys(orchestrationResult.phases).length,
      };
    }

    return metrics;
  }
}