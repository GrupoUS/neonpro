/**
 * TDD Orchestration Framework - Main Export File
 * Complete multi-agent TDD orchestration with quality control integration
 */

// Core Orchestration Components
export { TDDOrchestrator } from './tdd-orchestrator';
export { TDDAgentRegistry } from './agent-registry';
export { WorkflowEngine } from './workflows/workflow-engine';
export { QualityControlBridge, executeQualityControlCommand, validateQualityControlCommand } from './quality-control-bridge';
export { TestCoordinator } from './src/test-coordinator';

// Import classes for internal use
import { TDDOrchestrator } from './tdd-orchestrator';
import { TDDAgentRegistry } from './agent-registry';
import { WorkflowEngine } from './workflows/workflow-engine';
import { QualityControlBridge } from './quality-control-bridge';
import { TDDMetricsCollector } from './metrics/collector';
import { HealthcareComplianceValidator } from './compliance/healthcare-validator';

// Communication System
export {
  AgentMessageBus,
  AgentCommunicationProtocol,
  createCommunicationSystem,
  type SharedContext,
  type MessageBusOptions,
  type ProtocolOptions,
  type AgentHandshake,
  type CoordinationRequest,
  type CoordinationResponse,
} from './communication';

// Metrics and Analytics
export {
  TDDMetricsCollector,
  type MetricsSnapshot,
  type OrchestrationMetrics,
  type AgentMetrics,
  type QualityMetrics,
  type PerformanceMetrics,
  type HealthcareMetrics,
  type CoordinationMetrics,
} from './metrics/collector';

// Healthcare Compliance
export {
  HealthcareComplianceValidator,
  type LGPDValidationResult,
  type ANVISAValidationResult,
  type CFMValidationResult,
  type HealthcareComplianceReport,
  type AuditEntry,
} from './compliance/healthcare-validator';

// Type Definitions
export type {
  TDDPhase,
  AgentName,
  AgentType,
  AgentCoordinationPattern,
  AgentPriority,
  AgentSpecialization,
  WorkflowType,
  OrchestrationType,
  FeatureContext,
  OrchestrationContext,
  OrchestrationOptions,
  OrchestrationResult,
  OrchestrationMetrics as OrchestrationMetricsType,
  QualityControlContext,
  QualityControlResult,
  AgentCapability,
  AgentResult,
  AgentMessage,
  AgentAction,
  AgentTask,
  QualityGate,
  QualityGateResult,
  QualityGateStatus,
  OrchestrationState,
  PhaseResult,
  QualityAssessment,
  HealthcareComplianceContext,
  WorkflowConfig,
  PhaseConfig,
  AgentCoordinationConfig,
  AgentRegistry,
  OrchestrationWorkflow,
  HealthcareCompliance,
  TDDCycleResult,
  TDDMetrics,
} from './types';

/**
 * Create a complete TDD orchestration system
 */
export function createTDDOrchestrationSystem(options: {
  enableCommunication?: boolean;
  enableMetrics?: boolean;
  enableCompliance?: boolean;
  healthcareMode?: boolean;
} = {}) {
  const {
    enableCommunication = true,
    enableMetrics = true,
    enableCompliance = true,
    healthcareMode = false,
  } = options;

  // Initialize core components
  const agentRegistry = new TDDAgentRegistry();

  // Initialize communication system if enabled
  const communication = enableCommunication ? createCommunicationSystem() : null;

  // Initialize workflow engine with optional communication
  const workflowEngine = new WorkflowEngine(
    agentRegistry,
    communication?.messageBus
  );

  // Initialize orchestrator
  const orchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);

  // Initialize metrics collector if enabled
  const metrics = enableMetrics ? new TDDMetricsCollector() : null;

  // Initialize compliance validator if enabled
  const complianceValidator = enableCompliance ? new HealthcareComplianceValidator() : null;

  // Initialize quality control bridge
  const qualityControlBridge = new QualityControlBridge();

  return {
    // Core components
    orchestrator,
    agentRegistry,
    workflowEngine,
    qualityControlBridge,

    // Optional components
    communication: communication || null,
    metrics: metrics || null,
    complianceValidator: complianceValidator || null,

    // Convenience methods
    async initialize() {
      console.log('🚀 TDD Orchestration System initializing...');

      if (communication) {
        await communication.initialize();
      }

      console.log('✅ TDD Orchestration System ready');
      console.log('📋 Available agents:', agentRegistry.getAllAgents().map(a => a.name).join(', '));
      console.log('🔧 Available workflows:', workflowEngine.getAvailableWorkflows().join(', '));

      if (healthcareMode) {
        console.log('🏥 Healthcare compliance mode enabled (LGPD/ANVISA/CFM)');
      }

      return {
        orchestrator,
        agentRegistry,
        workflowEngine,
        qualityControlBridge,
        communication,
        metrics,
        complianceValidator,
      };
    },

    async shutdown() {
      console.log('🛑 TDD Orchestration System shutting down...');

      if (communication) {
        await communication.shutdown();
      }

      if (metrics) {
        metrics.reset();
      }

      console.log('✅ TDD Orchestration System shut down');
    },

    // Quality control execution
    async executeQualityControl(command: string, options: any = {}) {
      const result = await qualityControlBridge.executeQualityControl(command, options);

      if (metrics && result.orchestrationResult) {
        metrics.recordOrchestration(
          result.orchestrationResult,
          {} as OrchestrationContext,
          result.duration
        );
      }

      return result;
    },

    // Complete TDD cycle execution
    async executeTDDCycle(feature: FeatureContext, options: OrchestrationOptions = {}) {
      const result = await orchestrator.executeFullTDDCycle(feature, options);

      if (metrics) {
        metrics.recordOrchestration(
          result,
          {
            featureName: feature.name,
            featureType: feature.domain.join(', '),
            complexity: feature.complexity,
            criticalityLevel: feature.complexity === 'high' ? 'critical' : feature.complexity,
            requirements: feature.requirements,
            healthcareCompliance: {
              required: options.healthcare || false,
              lgpd: options.healthcare,
              anvisa: options.healthcare,
              cfm: options.healthcare,
            },
          },
          result.duration || 0
        );
      }

      return result;
    },

    // Get system status
    getStatus() {
      const status = {
        system: 'TDD Orchestration Framework',
        version: '1.0.0',
        status: 'ready',
        components: {
          orchestrator: 'active',
          agentRegistry: `${agentRegistry.getAllAgents().length} agents registered`,
          workflowEngine: `${workflowEngine.getAvailableWorkflows().length} workflows available`,
          qualityControlBridge: 'active',
        },
        capabilities: {
          multiAgentCoordination: true,
          parallelExecution: true,
          qualityControlIntegration: true,
          healthcareCompliance: !!complianceValidator,
          metricsCollection: !!metrics,
          realtimeCommunication: !!communication,
        },
        healthcareMode,
      };

      // Add optional component status
      if (communication) {
        const commStats = communication.getSystemStats();
        status.components.communication = `${commStats.protocol.registeredAgents} agents, ${commStats.messageBus.totalMessages} messages`;
      }

      if (metrics) {
        const snapshot = metrics.getMetricsSnapshot();
        status.components.metrics = `${snapshot.orchestration.totalExecutions} executions, ${snapshot.quality.overallQualityScore.toFixed(1)} avg quality`;
      }

      if (complianceValidator) {
        status.components.compliance = 'LGPD/ANVISA/CFM validation active';
      }

      return status;
    },

    // Get comprehensive metrics
    getMetrics() {
      if (!metrics) {
        return { error: 'Metrics collection not enabled' };
      }

      return {
        snapshot: metrics.getMetricsSnapshot(),
        performance: metrics.getPerformanceAnalytics(),
        quality: metrics.getQualityReport(),
        healthcare: complianceValidator ? 'Available via complianceValidator.generateComplianceReport()' : 'Not available',
      };
    },

    // Validate healthcare compliance
    async validateCompliance(context: OrchestrationContext, results: AgentResult[]) {
      if (!complianceValidator) {
        throw new Error('Compliance validator not enabled');
      }

      return await complianceValidator.validateCompliance(context, results);
    },

    // Get available commands and examples
    getCommandExamples() {
      return {
        availableCommands: qualityControlBridge.getAvailableCommands(),
        examples: qualityControlBridge.getCommandExamples(),
        workflows: workflowEngine.getAvailableWorkflows(),
        agents: agentRegistry.getAllAgents().map(a => ({
          name: a.name,
          type: a.type,
          capabilities: a.capabilities,
          specializations: a.specializations,
          healthcareCompliance: a.healthcareCompliance,
        })),
      };
    },
  };
}

/**
 * Convenience function for quick quality control execution
 */
export async function executeQualityControl(
  command: string,
  options: any = {}
): Promise<QualityControlResult> {
  const bridge = new QualityControlBridge();
  return await bridge.executeQualityControl(command, options);
}

/**
 * Convenience function for creating and running a TDD cycle
 */
export async function runTDDCycle(
  feature: FeatureContext,
  options: OrchestrationOptions & {
    enableMetrics?: boolean;
    enableCompliance?: boolean;
  } = {}
): Promise<OrchestrationResult> {
  const system = createTDDOrchestrationSystem({
    enableMetrics: options.enableMetrics ?? true,
    enableCompliance: options.enableCompliance ?? options.healthcare,
    healthcareMode: options.healthcare,
  });

  await system.initialize();

  try {
    const result = await system.executeTDDCycle(feature, options);
    return result;
  } finally {
    await system.shutdown();
  }
}