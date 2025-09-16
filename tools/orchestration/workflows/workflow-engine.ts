/**
 * Workflow Engine for TDD Orchestration Framework
 * Manages workflow execution, agent coordination patterns, and quality gates
 */

import {
  WorkflowType,
  WorkflowConfig,
  TDDPhase,
  AgentName,
  PhaseConfig,
  AgentCoordinationConfig,
  QualityGate,
  OrchestrationOptions,
  FeatureContext,
  AgentRegistry
} from '../types';
import { createLogger } from '../utils/logger';

export class WorkflowEngine {
  private logger = createLogger('WorkflowEngine');
  private agentRegistry: AgentRegistry;
  private workflows: Map<WorkflowType, WorkflowConfig> = new Map();

  constructor(agentRegistry: AgentRegistry) {
    this.agentRegistry = agentRegistry;
    this.initializeWorkflows();
  }

  private initializeWorkflows(): void {
    this.workflows.set('standard-tdd', this.createStandardTDDWorkflow());
    this.workflows.set('security-critical-tdd', this.createSecurityCriticalWorkflow());
    this.workflows.set('microservices-tdd', this.createMicroservicesWorkflow());
    this.workflows.set('legacy-tdd', this.createLegacyWorkflow());
    this.workflows.set('healthcare-tdd', this.createHealthcareWorkflow());
  }

  /**
   * Execute a specific workflow with given feature context
   */
  async executeWorkflow(
    workflowType: WorkflowType,
    feature: FeatureContext,
    options: OrchestrationOptions
  ): Promise<any> {
    this.logger.info(`Starting workflow: ${workflowType}`, { feature: feature.name });

    const workflow = this.workflows.get(workflowType);
    if (!workflow) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    try {
      // Execute each phase according to workflow configuration
      const results = {};
      
      for (const phase of (['red', 'green', 'refactor'] as TDDPhase[])) {
        this.logger.info(`Executing phase: ${phase}`);
        const phaseResult = await this.executePhase(workflow, phase, feature, options);
        results[phase] = phaseResult;
      }

      this.logger.success(`Workflow ${workflowType} completed successfully`);
      return results;
      
    } catch (error) {
      this.logger.error(`Workflow ${workflowType} failed`, error);
      throw error;
    }
  }

  private async executePhase(
    workflow: WorkflowConfig,
    phase: TDDPhase,
    feature: FeatureContext,
    options: OrchestrationOptions
  ): Promise<any> {
    const phaseConfig = workflow.phases[phase];
    const agents = this.selectAgentsForPhase(phaseConfig, feature);
    
    this.logger.debug(`Phase ${phase} configuration`, { 
      primaryAgent: phaseConfig.primaryAgent,
      supportAgents: phaseConfig.supportAgents,
      executionMode: phaseConfig.executionMode
    });

    switch (phaseConfig.executionMode) {
      case 'sequential':
        return await this.executeSequential(agents, phase, feature);
      case 'parallel':
        return await this.executeParallel(agents, phase, feature);
      case 'mixed':
        return await this.executeMixed(agents, phase, feature, phaseConfig);
      default:
        throw new Error(`Unknown execution mode: ${phaseConfig.executionMode}`);
    }
  }

  private selectAgentsForPhase(phaseConfig: PhaseConfig, feature: FeatureContext): AgentName[] {
    const agents: AgentName[] = [phaseConfig.primaryAgent];
    
    // Add support agents based on feature complexity and domain
    phaseConfig.supportAgents.forEach(agent => {
      if (this.shouldIncludeAgent(agent, feature)) {
        agents.push(agent);
      }
    });

    return [...new Set(agents)]; // Remove duplicates
  }

  private shouldIncludeAgent(agent: AgentName, feature: FeatureContext): boolean {
    // Logic to determine if agent should be included based on feature context
    switch (agent) {
      case 'security-auditor':
        return feature.domain.includes('security') || feature.domain.includes('healthcare');
      case 'architect-review':
        return feature.complexity === 'high' || feature.domain.includes('architecture');
      default:
        return true;
    }
  }

  private async executeSequential(
    agents: AgentName[],
    phase: TDDPhase,
    feature: FeatureContext
  ): Promise<any> {
    const results = [];
    
    for (const agent of agents) {
      this.logger.debug(`Executing agent: ${agent}`);
      const result = await this.executeAgent(agent, phase, feature);
      results.push(result);
    }
    
    return results;
  }

  private async executeParallel(
    agents: AgentName[],
    phase: TDDPhase,
    feature: FeatureContext
  ): Promise<any> {
    this.logger.debug(`Executing ${agents.length} agents in parallel`);
    
    const promises = agents.map(agent => this.executeAgent(agent, phase, feature));
    return await Promise.all(promises);
  }

  private async executeMixed(
    agents: AgentName[],
    phase: TDDPhase,
    feature: FeatureContext,
    config: PhaseConfig
  ): Promise<any> {
    // Execute primary agent first, then support agents in parallel
    const primaryResult = await this.executeAgent(config.primaryAgent, phase, feature);
    
    const supportAgents = agents.filter(agent => agent !== config.primaryAgent);
    const supportResults = await this.executeParallel(supportAgents, phase, feature);
    
    return { primary: primaryResult, support: supportResults };
  }

  private async executeAgent(agent: AgentName, phase: TDDPhase, feature: FeatureContext): Promise<any> {
    // Mock implementation - in real system would delegate to actual agents
    this.logger.debug(`Agent ${agent} executing for phase ${phase}`);
    
    // Simulate agent execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    return {
      agent,
      phase,
      feature: feature.name,
      success: true,
      duration: Math.random() * 1000 + 500,
      output: `Agent ${agent} completed ${phase} phase for ${feature.name}`
    };
  }

  // Workflow Creation Methods
  private createStandardTDDWorkflow(): WorkflowConfig {
    return {
      type: 'standard-tdd',
      name: 'Standard TDD Workflow',
      description: 'Basic red-green-refactor cycle with balanced agent coordination',
      phases: {
        red: {
          primaryAgent: 'test',
          supportAgents: ['architect-review'],
          executionMode: 'sequential',
          maxIterations: 3,
          timeoutMinutes: 10,
          requiredQualityScore: 8.0
        },
        green: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['test'],
          executionMode: 'mixed',
          maxIterations: 5,
          timeoutMinutes: 15,
          requiredQualityScore: 8.5
        },
        refactor: {
          primaryAgent: 'architect-review',
          supportAgents: ['code-reviewer', 'security-auditor'],
          executionMode: 'parallel',
          maxIterations: 3,
          timeoutMinutes: 12,
          requiredQualityScore: 9.0
        }
      },
      qualityGates: this.createStandardQualityGates(),
      agentCoordination: {
        communicationProtocol: 'message-passing',
        conflictResolution: 'coordinator-decides',
        stateSharing: {
          featureSpec: true,
          codeChanges: true,
          testSuite: true,
          qualityMetrics: true,
          securityFindings: false
        }
      }
    };
  }

  private createSecurityCriticalWorkflow(): WorkflowConfig {
    return {
      type: 'security-critical-tdd',
      name: 'Security-Critical TDD Workflow',
      description: 'Enhanced TDD with comprehensive security validation',
      phases: {
        red: {
          primaryAgent: 'security-auditor',
          supportAgents: ['test', 'architect-review'],
          executionMode: 'sequential',
          maxIterations: 2,
          timeoutMinutes: 15,
          requiredQualityScore: 9.0
        },
        green: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['security-auditor', 'test'],
          executionMode: 'mixed',
          maxIterations: 3,
          timeoutMinutes: 20,
          requiredQualityScore: 9.2
        },
        refactor: {
          primaryAgent: 'security-auditor',
          supportAgents: ['architect-review', 'code-reviewer'],
          executionMode: 'sequential',
          maxIterations: 4,
          timeoutMinutes: 18,
          requiredQualityScore: 9.5
        }
      },
      qualityGates: this.createSecurityQualityGates(),
      agentCoordination: {
        communicationProtocol: 'event-driven',
        conflictResolution: 'consensus',
        stateSharing: {
          featureSpec: true,
          codeChanges: true,
          testSuite: true,
          qualityMetrics: true,
          securityFindings: true
        }
      }
    };
  }  private createMicroservicesWorkflow(): WorkflowConfig {
    return {
      type: 'microservices-tdd',
      name: 'Microservices TDD Workflow', 
      description: 'TDD workflow optimized for microservices architecture',
      phases: {
        red: {
          primaryAgent: 'architect-review',
          supportAgents: ['test', 'security-auditor'],
          executionMode: 'mixed',
          maxIterations: 4,
          timeoutMinutes: 20,
          requiredQualityScore: 8.5
        },
        green: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['architect-review', 'test'],
          executionMode: 'parallel',
          maxIterations: 6,
          timeoutMinutes: 25,
          requiredQualityScore: 8.8
        },
        refactor: {
          primaryAgent: 'architect-review',
          supportAgents: ['code-reviewer', 'security-auditor'],
          executionMode: 'sequential',
          maxIterations: 5,
          timeoutMinutes: 22,
          requiredQualityScore: 9.2
        }
      },
      qualityGates: this.createMicroservicesQualityGates(),
      agentCoordination: {
        communicationProtocol: 'event-driven',
        conflictResolution: 'priority-based',
        stateSharing: {
          featureSpec: true,
          codeChanges: true,
          testSuite: true,
          qualityMetrics: true,
          securityFindings: true
        }
      }
    };
  }

  private createLegacyWorkflow(): WorkflowConfig {
    return {
      type: 'legacy-tdd',
      name: 'Legacy Code TDD Workflow',
      description: 'TDD workflow for legacy code refactoring with safety focus',
      phases: {
        red: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['architect-review'],
          executionMode: 'sequential',
          maxIterations: 2,
          timeoutMinutes: 12,
          requiredQualityScore: 7.5
        },
        green: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['test'],
          executionMode: 'mixed',
          maxIterations: 8,
          timeoutMinutes: 30,
          requiredQualityScore: 8.0
        },
        refactor: {
          primaryAgent: 'architect-review',
          supportAgents: ['code-reviewer', 'security-auditor'],
          executionMode: 'sequential',
          maxIterations: 10,
          timeoutMinutes: 35,
          requiredQualityScore: 8.8
        }
      },
      qualityGates: this.createLegacyQualityGates(),
      agentCoordination: {
        communicationProtocol: 'shared-state',
        conflictResolution: 'coordinator-decides',
        stateSharing: {
          featureSpec: true,
          codeChanges: true,
          testSuite: true,
          qualityMetrics: true,
          securityFindings: false
        }
      }
    };
  }

  private createHealthcareWorkflow(): WorkflowConfig {
    return {
      type: 'healthcare-tdd',
      name: 'Healthcare TDD Workflow',
      description: 'TDD workflow with LGPD/ANVISA compliance and healthcare-specific validation',
      phases: {
        red: {
          primaryAgent: 'security-auditor',
          supportAgents: ['architect-review', 'test'],
          executionMode: 'sequential',
          maxIterations: 2,
          timeoutMinutes: 18,
          requiredQualityScore: 9.2
        },
        green: {
          primaryAgent: 'code-reviewer',
          supportAgents: ['security-auditor', 'test'],
          executionMode: 'mixed',
          maxIterations: 4,
          timeoutMinutes: 25,
          requiredQualityScore: 9.5
        },
        refactor: {
          primaryAgent: 'security-auditor',
          supportAgents: ['architect-review', 'code-reviewer'],
          executionMode: 'sequential',
          maxIterations: 6,
          timeoutMinutes: 28,
          requiredQualityScore: 9.8
        }
      },
      qualityGates: this.createHealthcareQualityGates(),
      agentCoordination: {
        communicationProtocol: 'event-driven',
        conflictResolution: 'consensus',
        stateSharing: {
          featureSpec: true,
          codeChanges: true,
          testSuite: true,
          qualityMetrics: true,
          securityFindings: true
        }
      }
    };
  }  // Quality Gates Creation Methods
  private createStandardQualityGates(): QualityGate[] {
    return [
      {
        id: 'test-coverage',
        name: 'Test Coverage',
        description: 'Minimum test coverage threshold',
        threshold: 80,
        metric: 'coverage_percentage',
        required: true
      },
      {
        id: 'code-quality',
        name: 'Code Quality Score',
        description: 'Overall code quality assessment',
        threshold: 8.0,
        metric: 'quality_score',
        required: true
      },
      {
        id: 'performance',
        name: 'Performance Threshold',
        description: 'Response time threshold',
        threshold: 500,
        metric: 'response_time_ms',
        required: false
      }
    ];
  }

  private createSecurityQualityGates(): QualityGate[] {
    return [
      ...this.createStandardQualityGates(),
      {
        id: 'security-scan',
        name: 'Security Vulnerability Scan',
        description: 'No critical security vulnerabilities',
        threshold: 0,
        metric: 'critical_vulnerabilities',
        required: true
      },
      {
        id: 'auth-validation',
        name: 'Authentication Validation',
        description: 'Authentication mechanisms properly tested',
        threshold: 100,
        metric: 'auth_test_coverage',
        required: true
      },
      {
        id: 'data-encryption',
        name: 'Data Encryption Compliance',
        description: 'Sensitive data encryption validation',
        threshold: 100,
        metric: 'encryption_compliance',
        required: true
      }
    ];
  }

  private createMicroservicesQualityGates(): QualityGate[] {
    return [
      ...this.createStandardQualityGates(),
      {
        id: 'api-contracts',
        name: 'API Contract Validation',
        description: 'All API contracts properly validated',
        threshold: 100,
        metric: 'contract_compliance',
        required: true
      },
      {
        id: 'service-isolation',
        name: 'Service Isolation',
        description: 'Service boundaries properly isolated',
        threshold: 90,
        metric: 'isolation_score',
        required: true
      },
      {
        id: 'distributed-testing',
        name: 'Distributed System Testing',
        description: 'Integration tests for distributed scenarios',
        threshold: 85,
        metric: 'distributed_test_coverage',
        required: true
      }
    ];
  }  private createLegacyQualityGates(): QualityGate[] {
    return [
      {
        id: 'test-coverage',
        name: 'Test Coverage',
        description: 'Legacy code test coverage (lower threshold)',
        threshold: 60,
        metric: 'coverage_percentage',
        required: true
      },
      {
        id: 'code-quality',
        name: 'Code Quality Score',
        description: 'Improved code quality from baseline',
        threshold: 7.0,
        metric: 'quality_score',
        required: true
      },
      {
        id: 'refactoring-safety',
        name: 'Refactoring Safety',
        description: 'No breaking changes introduced',
        threshold: 100,
        metric: 'safety_score',
        required: true
      },
      {
        id: 'technical-debt',
        name: 'Technical Debt Reduction',
        description: 'Technical debt improvement',
        threshold: 10,
        metric: 'debt_reduction_percentage',
        required: false
      }
    ];
  }

  private createHealthcareQualityGates(): QualityGate[] {
    return [
      ...this.createSecurityQualityGates(),
      {
        id: 'lgpd-compliance',
        name: 'LGPD Compliance',
        description: 'Full LGPD compliance validation',
        threshold: 100,
        metric: 'lgpd_compliance_score',
        required: true
      },
      {
        id: 'anvisa-compliance',
        name: 'ANVISA Compliance',
        description: 'Healthcare regulatory compliance',
        threshold: 100,
        metric: 'anvisa_compliance_score',
        required: true
      },
      {
        id: 'patient-data-protection',
        name: 'Patient Data Protection',
        description: 'Patient data handling compliance',
        threshold: 100,
        metric: 'patient_data_protection_score',
        required: true
      },
      {
        id: 'audit-trail',
        name: 'Audit Trail Completeness',
        description: 'Complete audit trail for sensitive operations',
        threshold: 100,
        metric: 'audit_trail_coverage',
        required: true
      }
    ];
  }

  /**
   * Get available workflows
   */
  getAvailableWorkflows(): WorkflowType[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * Get workflow configuration
   */
  getWorkflowConfig(workflowType: WorkflowType): WorkflowConfig | undefined {
    return this.workflows.get(workflowType);
  }

  /**
   * Validate workflow configuration
   */
  validateWorkflow(workflowType: WorkflowType): boolean {
    const workflow = this.workflows.get(workflowType);
    if (!workflow) return false;

    // Basic validation
    const requiredPhases: TDDPhase[] = ['red', 'green', 'refactor'];
    return requiredPhases.every(phase => workflow.phases[phase] !== undefined);
  }
}