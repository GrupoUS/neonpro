/**
 * Quality Control Bridge - Maps quality control commands to TDD orchestrator
 * Integrates the quality control command with multi-agent orchestration
 */

import {
  QualityControlContext,
  QualityControlResult,
  OrchestrationOptions,
  FeatureContext,
  AgentName,
  WorkflowType,
  AgentCoordinationPattern,
  HealthcareComplianceContext,
} from './types';
import { TDDOrchestrator } from './tdd-orchestrator';
import { TDDAgentRegistry } from './agent-registry';
import { WorkflowEngine } from './workflows/workflow-engine';

export interface QualityControlBridgeOptions {
  verbose?: boolean;
  dryRun?: boolean;
  timeout?: number;
  maxRetries?: number;
}

export class QualityControlBridge {
  private tddOrchestrator: TDDOrchestrator;
  private verbose: boolean = false;

  constructor() {
    // Initialize orchestration components
    const agentRegistry = new TDDAgentRegistry();
    const workflowEngine = new WorkflowEngine();
    this.tddOrchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);
  }

  /**
   * Execute quality control command with orchestration
   * Main entry point for quality control command integration
   */
  async executeQualityControl(
    command: string,
    options: QualityControlBridgeOptions = {}
  ): Promise<QualityControlResult> {
    this.verbose = options.verbose || false;
    const startTime = Date.now();

    try {
      this.log(`🔍 Quality Control Bridge: Executing command: ${command}`);

      // Parse quality control command
      const qualityContext = this.parseQualityControlCommand(command);
      this.log(`📋 Parsed context: ${JSON.stringify(qualityContext, null, 2)}`);

      // Create orchestration options
      const orchestrationOptions: OrchestrationOptions = this.createOrchestrationOptions(
        qualityContext,
        options
      );

      // Handle dry run mode
      if (options.dryRun) {
        return this.handleDryRun(qualityContext, orchestrationOptions);
      }

      // Execute through TDD orchestrator
      const result = await this.tddOrchestrator.executeQualityControlWorkflow(
        qualityContext,
        orchestrationOptions
      );

      const duration = Date.now() - startTime;
      this.log(`✅ Quality Control completed in ${duration}ms with score: ${result.qualityScore}/10`);

      return {
        ...result,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Quality Control Bridge failed: ${error}`);

      return {
        success: false,
        action: 'error',
        duration,
        results: {},
        agentResults: [],
        qualityScore: 0,
        recommendations: [`Bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        nextActions: ['Review bridge configuration and retry'],
        metrics: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Parse quality control command string into context
   */
  private parseQualityControlCommand(command: string): QualityControlContext {
    // Remove leading slash and split into parts
    const parts = command.replace(/^\//, '').split(/\s+/);
    const baseCommand = parts[0]; // e.g., 'quality-control'
    const action = parts[1] || 'comprehensive'; // e.g., 'test', 'analyze', etc.

    const context: QualityControlContext = {
      action,
    };

    // Parse flags and options
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];

      if (part.startsWith('--')) {
        const [flag, value] = part.split('=');

        switch (flag) {
          case '--type':
            context.type = value as any;
            break;
          case '--depth':
            context.depth = value as any;
            break;
          case '--target':
            context.target = value;
            break;
          case '--workflow':
            context.workflow = value as WorkflowType;
            break;
          case '--coordination':
            context.coordination = value as AgentCoordinationPattern;
            break;
          case '--agents':
            context.agents = value ? value.split(',') as AgentName[] : undefined;
            break;
          case '--healthcare':
            context.healthcare = true;
            break;
          case '--parallel':
            context.parallel = true;
            break;
          case '--orchestrator':
            context.orchestrator = value === 'true' || value === undefined;
            break;
        }
      } else if (part.startsWith('-')) {
        // Handle short flags
        switch (part) {
          case '-h':
          case '--healthcare':
            context.healthcare = true;
            break;
          case '-p':
          case '--parallel':
            context.parallel = true;
            break;
          case '-v':
          case '--verbose':
            this.verbose = true;
            break;
        }
      } else if (!context.target) {
        // Assume it's a target if no explicit --target was provided
        context.target = part;
      }
    }

    // Set defaults based on action
    this.applyActionDefaults(context);

    return context;
  }

  /**
   * Apply default settings based on action type
   */
  private applyActionDefaults(context: QualityControlContext): void {
    switch (context.action) {
      case 'tdd-cycle':
      case 'tdd-critical':
        context.orchestrator = true;
        context.workflow = context.action === 'tdd-critical' ? 'security-critical-tdd' : 'standard-tdd';
        break;

      case 'comprehensive':
        context.parallel = context.parallel ?? true;
        context.coordination = context.coordination || 'parallel';
        context.agents = context.agents || ['test', 'code-reviewer', 'architect-review', 'security-auditor'];
        break;

      case 'healthcare':
        context.healthcare = true;
        context.workflow = 'healthcare-tdd';
        context.coordination = 'hierarchical';
        context.agents = ['security-auditor', 'test', 'code-reviewer', 'architect-review'];
        break;

      case 'security':
      case 'compliance':
        context.agents = context.agents || ['security-auditor'];
        context.healthcare = context.healthcare ?? true; // Default to healthcare for security
        break;

      case 'performance':
        context.agents = context.agents || ['architect-review', 'test'];
        context.coordination = context.coordination || 'parallel';
        break;

      case 'test':
        context.agents = context.agents || ['test'];
        break;

      case 'analyze':
        context.agents = context.agents || ['code-reviewer', 'architect-review'];
        context.parallel = context.parallel ?? true;
        break;

      case 'debug':
        context.agents = context.agents || ['code-reviewer', 'architect-review'];
        context.coordination = context.coordination || 'sequential';
        break;

      case 'cleanup':
      case 'format':
        context.agents = context.agents || ['code-reviewer'];
        break;
    }

    // Set default depth if not specified
    if (!context.depth) {
      context.depth = context.healthcare ? 'L8' : 'L5';
    }

    // Set default coordination pattern
    if (!context.coordination) {
      context.coordination = context.parallel ? 'parallel' : 'sequential';
    }
  }

  /**
   * Create orchestration options from quality control context
   */
  private createOrchestrationOptions(
    qualityContext: QualityControlContext,
    bridgeOptions: QualityControlBridgeOptions
  ): OrchestrationOptions {
    return {
      type: qualityContext.orchestrator ? 'full-cycle' : 'agent-specific',
      feature: this.createFeatureContext(qualityContext),
      workflow: qualityContext.workflow,
      agents: qualityContext.agents,
      parallel: qualityContext.parallel,
      healthcare: qualityContext.healthcare,
      securityCritical: qualityContext.type === 'security' || qualityContext.type === 'compliance',
      verbose: this.verbose,
      dryRun: bridgeOptions.dryRun,
      timeout: bridgeOptions.timeout,
      maxIterations: qualityContext.depth ? parseInt(qualityContext.depth.replace('L', '')) : 5,
    };
  }

  /**
   * Create feature context from quality control context
   */
  private createFeatureContext(qualityContext: QualityControlContext): FeatureContext {
    const complexity = this.mapDepthToComplexity(qualityContext.depth || 'L5');

    return {
      name: qualityContext.target || `Quality Control - ${qualityContext.action}`,
      complexity,
      domain: [qualityContext.type || 'general', 'quality-control'],
      requirements: [
        `${qualityContext.action} validation`,
        'Quality assurance compliance',
        ...(qualityContext.healthcare ? ['Healthcare compliance (LGPD/ANVISA/CFM)'] : []),
        ...(qualityContext.type === 'security' ? ['Security validation'] : []),
        ...(qualityContext.type === 'performance' ? ['Performance optimization'] : []),
      ],
    };
  }

  /**
   * Map quality control depth to feature complexity
   */
  private mapDepthToComplexity(depth: string): 'low' | 'medium' | 'high' {
    const depthNumber = parseInt(depth.replace('L', ''));
    if (depthNumber <= 3) return 'low';
    if (depthNumber <= 7) return 'medium';
    return 'high';
  }

  /**
   * Handle dry run mode - return what would be executed without running
   */
  private handleDryRun(
    qualityContext: QualityControlContext,
    orchestrationOptions: OrchestrationOptions
  ): QualityControlResult {
    this.log('🔍 DRY RUN MODE: Showing what would be executed');

    const selectedAgents = qualityContext.agents || ['code-reviewer', 'test'];
    const estimatedDuration = selectedAgents.length * (qualityContext.parallel ? 30000 : 60000); // Estimate

    return {
      success: true,
      action: `DRY_RUN_${qualityContext.action}`,
      duration: 0,
      results: {
        dryRun: {
          action: qualityContext.action,
          agents: selectedAgents,
          coordination: qualityContext.coordination,
          workflow: qualityContext.workflow,
          healthcare: qualityContext.healthcare,
          estimatedDuration: `${estimatedDuration / 1000}s`,
          features: orchestrationOptions.feature,
        },
      },
      agentResults: [],
      qualityScore: 0,
      recommendations: [
        `Would execute ${selectedAgents.length} agents: ${selectedAgents.join(', ')}`,
        `Coordination pattern: ${qualityContext.coordination}`,
        `Estimated duration: ${estimatedDuration / 1000} seconds`,
        ...(qualityContext.healthcare ? ['Healthcare compliance validation enabled'] : []),
        'Remove --dry-run flag to execute for real',
      ],
      nextActions: [
        'Review planned execution',
        'Adjust agents or coordination pattern if needed',
        'Run without --dry-run to execute',
      ],
      metrics: {
        dryRun: true,
        plannedAgents: selectedAgents.length,
        estimatedDuration,
      },
    };
  }

  /**
   * Get available quality control commands and their descriptions
   */
  getAvailableCommands(): Record<string, string> {
    return {
      'test': 'Execute testing suite with healthcare compliance validation',
      'analyze': 'Multi-dimensional analysis with code review and architecture assessment',
      'debug': 'Intelligent debugging with healthcare safety protocols',
      'validate': '30-second reality check ensuring changes work as expected',
      'compliance': 'LGPD/ANVISA/CFM regulatory compliance validation',
      'performance': 'Performance testing with medical workflow requirements',
      'security': 'Security scanning with patient data protection',
      'cleanup': 'Intelligent code cleanup with duplicate elimination',
      'format': 'Ultra-fast formatting with oxlint + dprint',
      'comprehensive': 'Complete quality assurance across all dimensions',
      'tdd-cycle': 'Full TDD red-green-refactor cycle with orchestration',
      'tdd-critical': 'Security-critical TDD workflow for sensitive features',
      'healthcare': 'Complete healthcare compliance validation workflow',
    };
  }

  /**
   * Get command examples with different orchestration patterns
   */
  getCommandExamples(): Record<string, string[]> {
    return {
      'Basic Commands': [
        '/quality-control test --healthcare',
        '/quality-control analyze --parallel',
        '/quality-control security --depth=L8',
        '/quality-control comprehensive --agents=all',
      ],
      'TDD Orchestration': [
        '/quality-control tdd-cycle --feature=user-auth --healthcare',
        '/quality-control tdd-critical --feature=patient-data --workflow=security-critical',
        '/quality-control orchestrate --pattern=parallel --agents=test,code-reviewer',
      ],
      'Healthcare Compliance': [
        '/quality-control healthcare --lgpd --anvisa --cfm',
        '/quality-control compliance --regulation=all --depth=L10',
        '/quality-control security patient-data --healthcare --coordination=hierarchical',
      ],
      'Parallel Execution': [
        '/quality-control comprehensive --parallel --coordination=hierarchical',
        '/quality-control analyze --agents=architect-review,code-reviewer --parallel',
        '/quality-control performance --coordination=parallel --healthcare',
      ],
      'Advanced Patterns': [
        '/quality-control tdd-cycle --workflow=microservices-tdd --agents=all',
        '/quality-control debug --coordination=event-driven --depth=L9',
        '/quality-control format --agents=code-reviewer --dry-run',
      ],
    };
  }

  /**
   * Logging utility
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[QC Bridge] ${message}`);
    }
  }
}

// Export convenience function for direct command execution
export async function executeQualityControlCommand(
  command: string,
  options: QualityControlBridgeOptions = {}
): Promise<QualityControlResult> {
  const bridge = new QualityControlBridge();
  return await bridge.executeQualityControl(command, options);
}

// Export command validation function
export function validateQualityControlCommand(command: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!command.startsWith('/quality-control') && !command.startsWith('quality-control')) {
    errors.push('Command must start with /quality-control or quality-control');
  }

  const parts = command.replace(/^\//, '').split(/\s+/);
  if (parts.length < 2) {
    errors.push('Action is required (e.g., test, analyze, comprehensive)');
  }

  const validActions = [
    'test', 'analyze', 'debug', 'validate', 'compliance', 'performance',
    'security', 'cleanup', 'format', 'comprehensive', 'tdd-cycle',
    'tdd-critical', 'healthcare', 'orchestrate'
  ];

  const action = parts[1];
  if (action && !validActions.includes(action)) {
    errors.push(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}