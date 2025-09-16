/**
 * Enhanced Quality Control Bridge - Advanced command parsing and orchestration
 * Integrates quality control commands with intelligent multi-agent orchestration
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
  enableMetrics?: boolean;
  enableCompliance?: boolean;
  healthcareMode?: boolean;
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}

export interface ParsedCommand {
  command: string;
  action: string;
  flags: Map<string, string>;
  options: Map<string, any>;
  targets: string[];
  metadata: {
    rawCommand: string;
    complexity: 'low' | 'medium' | 'high';
    estimatedDuration: number;
    resourceRequirements: {
      memory: number;
      cpu: number;
      agents: number;
    };
  };
}

export interface CommandTemplate {
  name: string;
  description: string;
  pattern: string;
  requiredParams: string[];
  optionalParams: string[];
  defaults: Record<string, any>;
  agentMapping: {
    primary: AgentName[];
    secondary: AgentName[];
    conditional: { condition: string; agents: AgentName[] }[];
  };
  workflow: WorkflowType;
  coordination: AgentCoordinationPattern;
  healthcare?: boolean;
}

export class QualityControlBridge {
  private tddOrchestrator: TDDOrchestrator;
  private verbose: boolean = false;
  private logLevel: string = 'info';
  private commandHistory: ParsedCommand[] = [];
  private commandTemplates: Map<string, CommandTemplate>;
  private executionStats: {
    totalCommands: number;
    successfulCommands: number;
    failedCommands: number;
    averageDuration: number;
    commandFrequency: Map<string, number>;
  };

  constructor() {
    // Initialize orchestration components
    const agentRegistry = new TDDAgentRegistry();
    const workflowEngine = new WorkflowEngine();
    this.tddOrchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);

    // Initialize command templates
    this.commandTemplates = this.initializeCommandTemplates();

    // Initialize statistics
    this.executionStats = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageDuration: 0,
      commandFrequency: new Map(),
    };
  }

  /**
   * Execute quality control command with enhanced orchestration
   * Main entry point for quality control command integration
   */
  async executeQualityControl(
    command: string,
    options: QualityControlBridgeOptions = {}
  ): Promise<QualityControlResult> {
    this.verbose = options.verbose || false;
    this.logLevel = options.logLevel || 'info';
    const startTime = Date.now();

    try {
      this.log(`🔍 Enhanced QC Bridge: Executing command: ${command}`, 'debug');

      // Parse command with enhanced parser
      const parsedCommand = this.parseCommand(command);
      this.logCommand(parsedCommand);

      // Update statistics
      this.updateCommandStats(parsedCommand);

      // Validate command
      const validation = this.validateCommand(parsedCommand);
      if (!validation.valid) {
        throw new Error(`Command validation failed: ${validation.errors.join(', ')}`);
      }

      // Create enhanced quality control context
      const qualityContext = this.createEnhancedQualityContext(parsedCommand);
      this.log(`📋 Enhanced context: ${JSON.stringify(qualityContext, null, 2)}`, 'debug');

      // Create orchestration options
      const orchestrationOptions: OrchestrationOptions = this.createEnhancedOrchestrationOptions(
        qualityContext,
        parsedCommand,
        options
      );

      // Handle dry run mode
      if (options.dryRun) {
        return this.handleEnhancedDryRun(qualityContext, orchestrationOptions, parsedCommand);
      }

      // Execute through TDD orchestrator with enhanced error handling
      const result = await this.executeWithRetryAndFallback(
        qualityContext,
        orchestrationOptions,
        options
      );

      const duration = Date.now() - startTime;
      this.log(`✅ Enhanced Quality Control completed in ${duration}ms with score: ${result.qualityScore}/10`, 'info');

      // Update execution statistics
      this.updateExecutionStats(true, duration);

      return {
        ...result,
        duration,
        orchestrationResult: result.orchestrationResult,
        parsedCommand,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`❌ Enhanced Quality Control Bridge failed: ${error}`, 'error');

      // Update execution statistics
      this.updateExecutionStats(false, duration);

      return {
        success: false,
        action: 'error',
        duration,
        results: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        agentResults: [],
        qualityScore: 0,
        recommendations: [
          `Enhanced bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Check command syntax and try again',
          'Use --help for command assistance',
        ],
        nextActions: [
          'Review bridge configuration',
          'Validate command syntax',
          'Check system requirements',
        ],
        metrics: {
          error: error instanceof Error ? error.message : 'Unknown error',
          commandFailed: true,
          duration,
        },
      };
    }
  }

  /**
   * Enhanced command parser with template matching
   */
  private parseCommand(command: string): ParsedCommand {
    const rawCommand = command.trim();
    
    // Normalize command - remove leading slash and normalize whitespace
    const normalized = rawCommand.replace(/^\//, '').replace(/\s+/g, ' ').trim();
    const parts = normalized.split(' ');
    
    const baseCommand = parts[0];
    const action = parts[1] || 'comprehensive';

    const parsed: ParsedCommand = {
      command: `${baseCommand} ${action}`,
      action,
      flags: new Map(),
      options: new Map(),
      targets: [],
      metadata: {
        rawCommand,
        complexity: 'medium',
        estimatedDuration: 30000, // 30 seconds default
        resourceRequirements: {
          memory: 512, // 512MB default
          cpu: 1, // 1 CPU default
          agents: 2, // 2 agents default
        },
      },
    };

    // Enhanced parsing with template matching
    const template = this.commandTemplates.get(action);
    if (template) {
      this.parseWithTemplate(parts, parsed, template);
    } else {
      this.parseGeneric(parts, parsed);
    }

    // Calculate complexity and resource requirements
    this.calculateComplexity(parsed);

    return parsed;
  }

  /**
   * Parse command using template
   */
  private parseWithTemplate(parts: string[], parsed: ParsedCommand, template: CommandTemplate): void {
    const flags = new Map<string, string>();
    const options = new Map<string, any>();

    // Apply template defaults
    for (const [key, value] of Object.entries(template.defaults)) {
      options.set(key, value);
    }

    // Parse command parts
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];

      if (part.startsWith('--')) {
        const [flag, value] = part.split('=', 2);
        flags.set(flag, value || 'true');
        options.set(flag.replace('--', ''), value || true);
      } else if (part.startsWith('-')) {
        flags.set(part, 'true');
        options.set(part.replace('-', ''), true);
      } else if (!part.startsWith('-')) {
        parsed.targets.push(part);
      }
    }

    // Apply template-specific logic
    if (template.conditional) {
      for (const conditional of template.conditional) {
        if (this.evaluateCondition(conditional.condition, options)) {
          // Add conditional agents or settings
          parsed.metadata.resourceRequirements.agents += conditional.agents.length;
        }
      }
    }

    parsed.flags = flags;
    parsed.options = options;

    // Apply template workflow and coordination
    parsed.options.set('workflow', template.workflow);
    parsed.options.set('coordination', template.coordination);

    // Set healthcare mode
    if (template.healthcare) {
      parsed.options.set('healthcare', true);
    }
  }

  /**
   * Parse generic command (no template)
   */
  private parseGeneric(parts: string[], parsed: ParsedCommand): void {
    const flags = new Map<string, string>();
    const options = new Map<string, any>();

    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];

      if (part.startsWith('--')) {
        const [flag, value] = part.split('=', 2);
        flags.set(flag, value || 'true');
        options.set(flag.replace('--', ''), value || true);
      } else if (part.startsWith('-')) {
        flags.set(part, 'true');
        options.set(part.replace('-', ''), true);
      } else if (!part.startsWith('-')) {
        parsed.targets.push(part);
      }
    }

    parsed.flags = flags;
    parsed.options = options;
  }

  /**
   * Evaluate condition for template logic
   */
  private evaluateCondition(condition: string, options: Map<string, any>): boolean {
    // Simple condition evaluation - can be extended for complex logic
    return options.has(condition) || options.has(condition.replace('--', ''));
  }

  /**
   * Calculate complexity and resource requirements
   */
  private calculateComplexity(parsed: ParsedCommand): void {
    const options = parsed.options;
    const flags = parsed.flags;

    // Base complexity
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    let memory = 512;
    let cpu = 1;
    let agents = 2;
    let duration = 30000;

    // Adjust based on action
    switch (parsed.action) {
      case 'comprehensive':
      case 'tdd-critical':
      case 'healthcare':
        complexity = 'high';
        memory = 1024;
        cpu = 2;
        agents = 4;
        duration = 60000;
        break;
      case 'tdd-cycle':
        complexity = 'high';
        memory = 768;
        cpu = 2;
        agents = 3;
        duration = 45000;
        break;
      case 'security':
      case 'compliance':
        complexity = 'high';
        memory = 1024;
        cpu = 2;
        agents = 3;
        duration = 50000;
        break;
      case 'performance':
        complexity = 'medium';
        memory = 768;
        cpu = 2;
        agents = 2;
        duration = 40000;
        break;
      case 'analyze':
        complexity = 'medium';
        memory = 512;
        cpu = 1;
        agents = 2;
        duration = 35000;
        break;
      case 'test':
      case 'validate':
        complexity = 'medium';
        memory = 512;
        cpu = 1;
        agents = 2;
        duration = 30000;
        break;
      case 'debug':
        complexity = 'low';
        memory = 256;
        cpu = 1;
        agents = 1;
        duration = 20000;
        break;
      case 'cleanup':
      case 'format':
        complexity = 'low';
        memory = 256;
        cpu = 1;
        agents = 1;
        duration = 15000;
        break;
    }

    // Adjust based on flags
    if (flags.has('--depth')) {
      const depth = flags.get('--depth') || 'L5';
      const depthNumber = parseInt(depth.replace('L', ''));
      if (depthNumber > 7) {
        complexity = 'high';
        memory = Math.max(memory, 1024);
        duration += 20000;
      }
    }

    if (flags.has('--parallel')) {
      duration *= 0.7; // Parallel execution is faster
      memory += 256;
      cpu += 1;
    }

    if (flags.has('--healthcare')) {
      complexity = complexity === 'low' ? 'medium' : 'high';
      memory += 256;
      duration += 10000;
    }

    if (flags.has('--agents')) {
      const agentCount = flags.get('--agents')?.split(',').length || 2;
      agents = Math.max(agents, agentCount);
      memory += (agentCount - 1) * 128;
    }

    parsed.metadata.complexity = complexity;
    parsed.metadata.estimatedDuration = duration;
    parsed.metadata.resourceRequirements = { memory, cpu, agents };
  }

  /**
   * Create enhanced quality control context
   */
  private createEnhancedQualityContext(parsedCommand: ParsedCommand): QualityControlContext {
    const options = parsedCommand.options;
    const flags = parsedCommand.flags;

    const context: QualityControlContext = {
      action: parsedCommand.action,
      type: options.get('type') as any,
      depth: options.get('depth') as any,
      target: options.get('target') || parsedCommand.targets[0],
      workflow: options.get('workflow') as WorkflowType,
      coordination: options.get('coordination') as AgentCoordinationPattern,
      agents: options.get('agents') as AgentName[],
      healthcare: options.get('healthcare') as boolean,
      parallel: options.get('parallel') as boolean,
      orchestrator: options.get('orchestrator') as boolean,
    };

    // Apply action-specific enhancements
    this.applyActionEnhancements(context, parsedCommand);

    // Set intelligent defaults
    this.setIntelligentDefaults(context, parsedCommand);

    return context;
  }

  /**
   * Apply action-specific enhancements
   */
  private applyActionEnhancements(context: QualityControlContext, parsed: ParsedCommand): void {
    const template = this.commandTemplates.get(context.action);
    if (!template) return;

    // Apply agent mapping from template
    const agents: AgentName[] = [];
    agents.push(...template.agentMapping.primary);
    agents.push(...template.agentMapping.secondary);

    // Apply conditional agents
    for (const conditional of template.agentMapping.conditional) {
      if (this.evaluateCondition(conditional.condition, parsed.options)) {
        agents.push(...conditional.agents);
      }
    }

    context.agents = agents;
    context.workflow = template.workflow;
    context.coordination = template.coordination;
    context.healthcare = context.healthcare || template.healthcare;
  }

  /**
   * Set intelligent defaults based on context
   */
  private setIntelligentDefaults(context: QualityControlContext, parsed: ParsedCommand): void {
    // Set default depth based on complexity
    if (!context.depth) {
      const depthMap = {
        low: 'L3',
        medium: 'L5',
        high: 'L8',
      };
      context.depth = depthMap[parsed.metadata.complexity] as any;
    }

    // Set default coordination pattern
    if (!context.coordination) {
      context.coordination = context.parallel ? 'parallel' : 'sequential';
    }

    // Set default workflow based on healthcare requirements
    if (!context.workflow) {
      context.workflow = context.healthcare ? 'healthcare-tdd' : 'standard-tdd';
    }

    // Set default agents based on action and complexity
    if (!context.agents || context.agents.length === 0) {
      context.agents = this.getDefaultAgents(context.action, context.healthcare);
    }

    // Enable orchestrator for complex actions
    if (!context.orchestrator) {
      context.orchestrator = ['tdd-cycle', 'tdd-critical', 'comprehensive'].includes(context.action);
    }
  }

  /**
   * Get default agents for action
   */
  private getDefaultAgents(action: string, healthcare: boolean): AgentName[] {
    const agentMap: Record<string, AgentName[]> = {
      test: ['test'],
      analyze: ['code-reviewer', 'architect-review'],
      debug: ['code-reviewer'],
      validate: ['test', 'code-reviewer'],
      compliance: ['security-auditor', 'test'],
      performance: ['architect-review', 'test'],
      security: ['security-auditor'],
      cleanup: ['code-reviewer'],
      format: ['code-reviewer'],
      comprehensive: ['test', 'code-reviewer', 'architect-review', 'security-auditor'],
      'tdd-cycle': ['tdd-orchestrator', 'code-reviewer'],
      'tdd-critical': ['tdd-orchestrator', 'security-auditor', 'architect-review'],
      healthcare: ['security-auditor', 'test', 'code-reviewer'],
    };

    const baseAgents = agentMap[action] || ['code-reviewer'];
    
    // Add healthcare agents if needed
    if (healthcare && !baseAgents.includes('security-auditor')) {
      return [...baseAgents, 'security-auditor'];
    }

    return baseAgents;
  }

  /**
   * Create enhanced orchestration options
   */
  private createEnhancedOrchestrationOptions(
    qualityContext: QualityControlContext,
    parsedCommand: ParsedCommand,
    bridgeOptions: QualityControlBridgeOptions
  ): OrchestrationOptions {
    return {
      type: qualityContext.orchestrator ? 'full-cycle' : 'agent-specific',
      feature: this.createEnhancedFeatureContext(qualityContext, parsedCommand),
      workflow: qualityContext.workflow,
      phase: this.determinePhase(qualityContext.action),
      agents: qualityContext.agents,
      allAgents: qualityContext.agents?.length === 0,
      parallel: qualityContext.parallel,
      healthcare: qualityContext.healthcare,
      securityCritical: qualityContext.type === 'security' || qualityContext.type === 'compliance',
      verbose: this.verbose,
      dryRun: bridgeOptions.dryRun,
      timeout: bridgeOptions.timeout || parsedCommand.metadata.estimatedDuration,
      maxIterations: this.determineMaxIterations(qualityContext.depth),
    };
  }

  /**
   * Create enhanced feature context
   */
  private createEnhancedFeatureContext(
    qualityContext: QualityControlContext,
    parsedCommand: ParsedCommand
  ): FeatureContext {
    return {
      name: qualityContext.target || `Quality Control - ${qualityContext.action}`,
      complexity: parsedCommand.metadata.complexity,
      domain: [
        qualityContext.type || 'general',
        'quality-control',
        ...(qualityContext.healthcare ? ['healthcare'] : []),
        ...(qualityContext.type === 'security' ? ['security'] : []),
      ],
      requirements: [
        `${qualityContext.action} validation`,
        'Quality assurance compliance',
        ...(qualityContext.healthcare ? ['Healthcare compliance (LGPD/ANVISA/CFM)'] : []),
        ...(qualityContext.type === 'security' ? ['Security validation'] : []),
        ...(qualityContext.type === 'performance' ? ['Performance optimization'] : []),
      ],
      dependencies: this.extractDependencies(parsedCommand),
    };
  }

  /**
   * Extract dependencies from parsed command
   */
  private extractDependencies(parsedCommand: ParsedCommand): string[] {
    const dependencies: string[] = [];
    
    if (parsedCommand.options.has('agents')) {
      const agents = parsedCommand.options.get('agents') as string;
      dependencies.push(...agents.split(','));
    }

    if (parsedCommand.options.has('workflow')) {
      dependencies.push(`workflow:${parsedCommand.options.get('workflow')}`);
    }

    return dependencies;
  }

  /**
   * Determine TDD phase based on action
   */
  private determinePhase(action: string): 'red' | 'green' | 'refactor' | undefined {
    const phaseMap: Record<string, 'red' | 'green' | 'refactor'> = {
      'tdd-cycle': 'red',
      'test': 'red',
      'validate': 'red',
      'analyze': 'refactor',
      'cleanup': 'refactor',
      'format': 'refactor',
    };

    return phaseMap[action];
  }

  /**
   * Determine max iterations based on depth
   */
  private determineMaxIterations(depth?: string): number {
    if (!depth) return 5;
    const depthNumber = parseInt(depth.replace('L', ''));
    return Math.max(1, Math.min(10, Math.ceil(depthNumber / 2)));
  }

  /**
   * Enhanced execution with retry and fallback
   */
  private async executeWithRetryAndFallback(
    qualityContext: QualityControlContext,
    orchestrationOptions: OrchestrationOptions,
    options: QualityControlBridgeOptions
  ): Promise<QualityControlResult> {
    const maxRetries = options.maxRetries || 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.tddOrchestrator.executeQualityControlWorkflow(
          qualityContext,
          orchestrationOptions
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.log(`Attempt ${attempt} failed: ${lastError.message}`, 'warn');

        if (attempt < maxRetries) {
          // Try fallback strategy
          const fallbackContext = this.createFallbackContext(qualityContext, attempt);
          const fallbackOptions = this.createFallbackOptions(orchestrationOptions, attempt);

          try {
            this.log(`Attempting fallback strategy`, 'info');
            return await this.tddOrchestrator.executeQualityControlWorkflow(
              fallbackContext,
              fallbackOptions
            );
          } catch (fallbackError) {
            this.log(`Fallback attempt ${attempt} failed`, 'warn');
          }
        }
      }
    }

    throw lastError || new Error('Unknown execution error');
  }

  /**
   * Create fallback context
   */
  private createFallbackContext(
    originalContext: QualityControlContext,
    attempt: number
  ): QualityControlContext {
    return {
      ...originalContext,
      // Reduce complexity for fallback
      depth: originalContext.depth ? `L${Math.max(3, parseInt(originalContext.depth.replace('L', '')) - 2)}` as any : 'L3',
      // Reduce parallelism for fallback
      parallel: attempt > 1 ? false : originalContext.parallel,
      // Reduce agent count for fallback
      agents: originalContext.agents?.slice(0, Math.max(1, originalContext.agents.length - 1)),
    };
  }

  /**
   * Create fallback options
   */
  private createFallbackOptions(
    originalOptions: OrchestrationOptions,
    attempt: number
  ): OrchestrationOptions {
    return {
      ...originalOptions,
      // Increase timeout for fallback
      timeout: (originalOptions.timeout || 30000) * 1.5,
      // Reduce max iterations for fallback
      maxIterations: Math.max(1, (originalOptions.maxIterations || 5) - 1),
    };
  }

  /**
   * Enhanced dry run handling
   */
  private handleEnhancedDryRun(
    qualityContext: QualityControlContext,
    orchestrationOptions: OrchestrationOptions,
    parsedCommand: ParsedCommand
  ): QualityControlResult {
    this.log('🔍 ENHANCED DRY RUN MODE: Detailed execution preview', 'info');

    const selectedAgents = qualityContext.agents || ['code-reviewer', 'test'];
    const estimatedDuration = parsedCommand.metadata.estimatedDuration;

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
          resourceRequirements: parsedCommand.metadata.resourceRequirements,
          complexity: parsedCommand.metadata.complexity,
          parsedCommand,
        },
        executionPlan: this.generateExecutionPlan(qualityContext, parsedCommand),
      },
      agentResults: [],
      qualityScore: 0,
      recommendations: [
        `Would execute ${selectedAgents.length} agents: ${selectedAgents.join(', ')}`,
        `Coordination pattern: ${qualityContext.coordination}`,
        `Workflow: ${qualityContext.workflow}`,
        `Estimated duration: ${estimatedDuration / 1000} seconds`,
        `Memory required: ${parsedCommand.metadata.resourceRequirements.memory}MB`,
        `CPU required: ${parsedCommand.metadata.resourceRequirements.cpu} cores`,
        ...(qualityContext.healthcare ? ['Healthcare compliance validation enabled'] : []),
        'Remove --dry-run flag to execute for real',
      ],
      nextActions: [
        'Review planned execution',
        'Adjust agents or coordination pattern if needed',
        'Validate resource requirements',
        'Run without --dry-run to execute',
      ],
      metrics: {
        dryRun: true,
        plannedAgents: selectedAgents.length,
        estimatedDuration,
        resourceRequirements: parsedCommand.metadata.resourceRequirements,
        complexity: parsedCommand.metadata.complexity,
      },
    };
  }

  /**
   * Generate execution plan for dry run
   */
  private generateExecutionPlan(
    qualityContext: QualityControlContext,
    parsedCommand: ParsedCommand
  ): any {
    return {
      phases: [
        {
          name: 'Initialization',
          duration: '2s',
          agents: ['orchestrator'],
          actions: ['Setup environment', 'Initialize agents'],
        },
        {
          name: qualityContext.action,
          duration: `${(parsedCommand.metadata.estimatedDuration - 2000) / 1000}s`,
          agents: qualityContext.agents,
          actions: [`${qualityContext.action} execution`],
        },
        {
          name: 'Finalization',
          duration: '3s',
          agents: ['orchestrator'],
          actions: ['Collect results', 'Generate report'],
        },
      ],
      totalDuration: `${parsedCommand.metadata.estimatedDuration / 1000}s`,
      resourceUtilization: parsedCommand.metadata.resourceRequirements,
    };
  }

  /**
   * Validate parsed command
   */
  private validateCommand(parsedCommand: ParsedCommand): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate command structure
    if (!parsedCommand.command) {
      errors.push('Command is required');
    }

    // Validate action
    const validActions = Array.from(this.commandTemplates.keys());
    if (!validActions.includes(parsedCommand.action)) {
      errors.push(`Invalid action: ${parsedCommand.action}. Valid actions: ${validActions.join(', ')}`);
    }

    // Validate template if available
    const template = this.commandTemplates.get(parsedCommand.action);
    if (template) {
      // Check required parameters
      for (const param of template.requiredParams) {
        if (!parsedCommand.options.has(param)) {
          errors.push(`Required parameter missing: ${param}`);
        }
      }
    }

    // Validate resource requirements
    const reqs = parsedCommand.metadata.resourceRequirements;
    if (reqs.memory > 4096) {
      errors.push('Memory requirement too high (max 4096MB)');
    }
    if (reqs.cpu > 8) {
      errors.push('CPU requirement too high (max 8 cores)');
    }
    if (reqs.agents > 8) {
      errors.push('Agent count too high (max 8 agents)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Enhanced logging
   */
  private log(message: string, level: string = 'info'): void {
    const levels = ['silent', 'error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex <= currentLevelIndex) {
      const prefix = `[QC Bridge ${level.toUpperCase()}]`;
      const logMessage = this.verbose ? `${prefix} ${message}` : message;
      
      switch (level) {
        case 'error':
          console.error(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'info':
        case 'debug':
          if (this.verbose) {
            console.log(logMessage);
          }
          break;
      }
    }
  }

  /**
   * Log parsed command for debugging
   */
  private logCommand(parsedCommand: ParsedCommand): void {
    this.commandHistory.push(parsedCommand);

    // Keep only last 100 commands
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(-100);
    }

    this.log(`Parsed command: ${parsedCommand.command}`, 'debug');
    this.log(`Action: ${parsedCommand.action}`, 'debug');
    this.log(`Flags: ${Array.from(parsedCommand.flags.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}`, 'debug');
    this.log(`Options: ${Array.from(parsedCommand.options.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}`, 'debug');
    this.log(`Targets: ${parsedCommand.targets.join(', ')}`, 'debug');
    this.log(`Complexity: ${parsedCommand.metadata.complexity}`, 'debug');
    this.log(`Estimated duration: ${parsedCommand.metadata.estimatedDuration}ms`, 'debug');
  }

  /**
   * Update command statistics
   */
  private updateCommandStats(parsedCommand: ParsedCommand): void {
    this.executionStats.totalCommands++;
    
    const frequency = this.executionStats.commandFrequency.get(parsedCommand.action) || 0;
    this.executionStats.commandFrequency.set(parsedCommand.action, frequency + 1);
  }

  /**
   * Update execution statistics
   */
  private updateExecutionStats(success: boolean, duration: number): void {
    if (success) {
      this.executionStats.successfulCommands++;
    } else {
      this.executionStats.failedCommands++;
    }

    // Update average duration
    const totalCommands = this.executionStats.successfulCommands + this.executionStats.failedCommands;
    const totalDuration = this.executionStats.averageDuration * (totalCommands - 1) + duration;
    this.executionStats.averageDuration = totalDuration / totalCommands;
  }

  /**
   * Initialize command templates
   */
  private initializeCommandTemplates(): Map<string, CommandTemplate> {
    const templates = new Map<string, CommandTemplate>();

    templates.set('test', {
      name: 'Test',
      description: 'Execute testing suite with healthcare compliance',
      pattern: 'test [--target=...] [--depth=L5] [--healthcare]',
      requiredParams: [],
      optionalParams: ['target', 'depth', 'healthcare'],
      defaults: { depth: 'L5', healthcare: false },
      agentMapping: {
        primary: ['test'],
        secondary: [],
        conditional: [
          { condition: '--healthcare', agents: ['security-auditor'] },
        ],
      },
      workflow: 'standard-tdd',
      coordination: 'sequential',
    });

    templates.set('analyze', {
      name: 'Analyze',
      description: 'Multi-dimensional code analysis',
      pattern: 'analyze [--target=...] [--depth=L5] [--parallel]',
      requiredParams: [],
      optionalParams: ['target', 'depth', 'parallel'],
      defaults: { depth: 'L5', parallel: false },
      agentMapping: {
        primary: ['code-reviewer'],
        secondary: ['architect-review'],
        conditional: [],
      },
      workflow: 'standard-tdd',
      coordination: 'parallel',
    });

    templates.set('comprehensive', {
      name: 'Comprehensive',
      description: 'Complete quality assurance across all dimensions',
      pattern: 'comprehensive [--depth=L7] [--parallel] [--healthcare]',
      requiredParams: [],
      optionalParams: ['depth', 'parallel', 'healthcare'],
      defaults: { depth: 'L7', parallel: true, healthcare: false },
      agentMapping: {
        primary: ['test', 'code-reviewer'],
        secondary: ['architect-review', 'security-auditor'],
        conditional: [],
      },
      workflow: 'standard-tdd',
      coordination: 'parallel',
    });

    templates.set('tdd-cycle', {
      name: 'TDD Cycle',
      description: 'Full TDD red-green-refactor cycle',
      pattern: 'tdd-cycle [--feature=...] [--healthcare]',
      requiredParams: [],
      optionalParams: ['feature', 'healthcare'],
      defaults: { healthcare: false },
      agentMapping: {
        primary: ['tdd-orchestrator'],
        secondary: ['code-reviewer'],
        conditional: [
          { condition: '--healthcare', agents: ['security-auditor'] },
        ],
      },
      workflow: 'standard-tdd',
      coordination: 'parallel',
    });

    templates.set('healthcare', {
      name: 'Healthcare',
      description: 'Complete healthcare compliance validation',
      pattern: 'healthcare [--regulation=...] [--depth=L8]',
      requiredParams: [],
      optionalParams: ['regulation', 'depth'],
      defaults: { depth: 'L8', regulation: 'all' },
      agentMapping: {
        primary: ['security-auditor', 'test'],
        secondary: ['code-reviewer', 'architect-review'],
        conditional: [],
      },
      workflow: 'healthcare-tdd',
      coordination: 'hierarchical',
      healthcare: true,
    });

    templates.set('security', {
      name: 'Security',
      description: 'Security scanning and validation',
      pattern: 'security [--target=...] [--depth=L8]',
      requiredParams: [],
      optionalParams: ['target', 'depth'],
      defaults: { depth: 'L8' },
      agentMapping: {
        primary: ['security-auditor'],
        secondary: ['architect-review'],
        conditional: [],
      },
      workflow: 'security-critical-tdd',
      coordination: 'sequential',
      healthcare: true,
    });

    return templates;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    return {
      ...this.executionStats,
      successRate: this.executionStats.totalCommands > 0 ? 
        (this.executionStats.successfulCommands / this.executionStats.totalCommands) * 100 : 0,
      commandHistory: this.commandHistory.slice(-10), // Last 10 commands
    };
  }

  /**
   * Get command templates
   */
  getCommandTemplates(): CommandTemplate[] {
    return Array.from(this.commandTemplates.values());
  }

  /**
   * Get available commands with enhanced information
   */
  getAvailableCommands(): Record<string, string> {
    const commands: Record<string, string> = {};
    
    for (const [action, template] of this.commandTemplates) {
      commands[action] = template.description;
    }

    return commands;
  }

  /**
   * Get enhanced command examples
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
        '/quality-control tdd-critical --feature=patient-data',
        '/quality-control orchestrate --pattern=parallel',
      ],
      'Healthcare Compliance': [
        '/quality-control healthcare --regulation=all',
        '/quality-control compliance --lgpd --anvisa --cfm',
        '/quality-control security patient-data --depth=L10',
      ],
      'Parallel Execution': [
        '/quality-control comprehensive --parallel --coordination=hierarchical',
        '/quality-control analyze --agents=architect-review,code-reviewer --parallel',
        '/quality-control performance --coordination=parallel',
      ],
      'Advanced Patterns': [
        '/quality-control tdd-cycle --workflow=microservices-tdd',
        '/quality-control debug --coordination=event-driven',
        '/quality-control format --dry-run --verbose',
      ],
    };
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

// Export enhanced command validation function
export function validateQualityControlCommand(command: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!command.startsWith('/quality-control') && !command.startsWith('quality-control')) {
    errors.push('Command must start with /quality-control or quality-control');
  }

  const parts = command.replace(/^\//, '').split(/\s+/);
  if (parts.length < 2) {
    errors.push('Action is required (e.g., test, analyze, comprehensive)');
  }

  const bridge = new QualityControlBridge();
  const validActions = Array.from(bridge.getCommandTemplates().map(t => t.name));

  const action = parts[1];
  if (action && !validActions.includes(action)) {
    errors.push(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}