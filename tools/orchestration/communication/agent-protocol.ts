/**
 * Agent Communication Protocol - Defines standards and utilities for inter-agent communication
 * Provides message formatting, validation, and coordination patterns
 */

import {
  AgentMessage,
  AgentName,
  TDDPhase,
  OrchestrationContext,
  AgentResult,
  QualityControlContext,
} from '../types';
import { AgentMessageBus, SharedContext } from './message-bus';

export interface ProtocolOptions {
  enforceStrictValidation?: boolean;
  enableAuditTrail?: boolean;
  maxMessageSize?: number;
  compressionThreshold?: number;
}

export interface AgentHandshake {
  agentName: AgentName;
  capabilities: string[];
  version: string;
  supportedProtocols: string[];
  healthcareCompliance: boolean;
}

export interface CoordinationRequest {
  requestType: 'permission' | 'resource' | 'priority' | 'conflict-resolution';
  requester: AgentName;
  details: any;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface CoordinationResponse {
  requestId: string;
  approved: boolean;
  coordinator: AgentName;
  instructions?: any;
  alternatives?: any[];
}

export class AgentCommunicationProtocol {
  private messageBus: AgentMessageBus;
  private options: ProtocolOptions;
  private registeredAgents: Map<AgentName, AgentHandshake> = new Map();
  private auditTrail: AgentMessage[] = [];

  constructor(messageBus: AgentMessageBus, options: ProtocolOptions = {}) {
    this.messageBus = messageBus;
    this.options = {
      enforceStrictValidation: true,
      enableAuditTrail: true,
      maxMessageSize: 1024 * 1024, // 1MB
      compressionThreshold: 10 * 1024, // 10KB
      ...options,
    };

    this.setupMessageHandlers();
  }

  /**
   * Register agent with the communication protocol
   */
  async registerAgent(handshake: AgentHandshake): Promise<boolean> {
    try {
      // Validate handshake
      if (!this.validateHandshake(handshake)) {
        throw new Error(`Invalid handshake from agent: ${handshake.agentName}`);
      }

      this.registeredAgents.set(handshake.agentName, handshake);

      // Send registration confirmation
      await this.messageBus.sendMessage({
        sender: 'tdd-orchestrator',
        receiver: handshake.agentName,
        type: 'coordination',
        priority: 'medium',
        context: {
          phase: 'red',
          feature: 'agent-registration',
          files: [],
        },
        payload: {
          registrationStatus: {
            success: true,
            assignedCapabilities: handshake.capabilities,
            protocolVersion: '1.0.0',
          },
        },
        timestamp: new Date(),
        correlationId: this.generateCorrelationId(),
      });

      console.log(`✅ Agent registered: ${handshake.agentName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register agent ${handshake.agentName}:`, error);
      return false;
    }
  }

  /**
   * Create analysis message
   */
  createAnalysisMessage(
    sender: AgentName,
    receiver: AgentName,
    context: OrchestrationContext,
    analysis: any
  ): AgentMessage {
    return this.createMessage(sender, receiver, 'analysis', 'medium', context, {
      analysis: {
        type: analysis.type,
        results: analysis.results,
        confidence: analysis.confidence,
        recommendations: analysis.recommendations,
        metadata: analysis.metadata,
      },
    });
  }

  /**
   * Create recommendation message
   */
  createRecommendationMessage(
    sender: AgentName,
    receiver: AgentName,
    context: OrchestrationContext,
    recommendation: any
  ): AgentMessage {
    return this.createMessage(sender, receiver, 'recommendation', 'medium', context, {
      recommendation: {
        type: recommendation.type,
        suggestion: recommendation.suggestion,
        priority: recommendation.priority,
        impact: recommendation.impact,
        implementation: recommendation.implementation,
        rationale: recommendation.rationale,
      },
    });
  }

  /**
   * Create validation message
   */
  createValidationMessage(
    sender: AgentName,
    receiver: AgentName,
    context: OrchestrationContext,
    validation: any
  ): AgentMessage {
    return this.createMessage(sender, receiver, 'validation', 'high', context, {
      validation: {
        target: validation.target,
        status: validation.status,
        issues: validation.issues,
        compliance: validation.compliance,
        healthcareChecks: validation.healthcareChecks,
      },
    });
  }

  /**
   * Create coordination request message
   */
  createCoordinationRequest(
    requester: AgentName,
    coordinator: AgentName,
    request: CoordinationRequest
  ): AgentMessage {
    const priority = request.urgency === 'critical' ? 'critical' :
      request.urgency === 'high' ? 'high' : 'medium';

    return this.createMessage(requester, coordinator, 'coordination', priority, {
      phase: 'refactor',
      feature: 'coordination',
      files: [],
    }, {
      coordinationRequest: request,
    });
  }

  /**
   * Create coordination response message
   */
  createCoordinationResponse(
    coordinator: AgentName,
    requester: AgentName,
    response: CoordinationResponse
  ): AgentMessage {
    return this.createMessage(coordinator, requester, 'coordination', 'high', {
      phase: 'refactor',
      feature: 'coordination',
      files: [],
    }, {
      coordinationResponse: response,
    });
  }

  /**
   * Broadcast agent result to all interested agents
   */
  async broadcastResult(
    sender: AgentName,
    context: OrchestrationContext,
    result: AgentResult
  ): Promise<void> {
    const message = this.createMessage(sender, 'broadcast', 'analysis', 'medium', context, {
      agentResult: {
        agent: result.agent,
        success: result.success,
        duration: result.duration,
        qualityScore: result.qualityScore,
        summary: result.output?.substring(0, 500), // Truncate for broadcast
        metrics: result.metrics,
        errors: result.errors,
        warnings: result.warnings,
      },
    });

    await this.messageBus.sendMessage(message);
  }

  /**
   * Request shared context access
   */
  async requestContextAccess(
    requester: AgentName,
    contextKeys: (keyof SharedContext)[]
  ): Promise<any> {
    const message = this.createMessage(
      requester,
      'tdd-orchestrator',
      'coordination',
      'medium',
      {
        phase: 'refactor',
        feature: 'context-access',
        files: [],
      },
      {
        contextRequest: {
          keys: contextKeys,
          purpose: 'parallel-execution',
        },
      }
    );

    await this.messageBus.sendMessage(message);

    // Return current context (simplified - in real implementation would wait for response)
    const sharedContext = this.messageBus.getSharedContext();
    return contextKeys.reduce((acc, key) => {
      acc[key] = sharedContext[key];
      return acc;
    }, {} as any);
  }

  /**
   * Update shared context with validation
   */
  async updateSharedContext(
    updater: AgentName,
    key: keyof SharedContext,
    value: any,
    metadata?: any
  ): Promise<void> {
    // Validate update permissions
    const agent = this.registeredAgents.get(updater);
    if (!agent) {
      throw new Error(`Unregistered agent attempting context update: ${updater}`);
    }

    // Check if agent has permission to update this context
    if (!this.hasContextUpdatePermission(agent, key)) {
      throw new Error(`Agent ${updater} does not have permission to update ${key}`);
    }

    // Update context through message bus
    this.messageBus.updateSharedContext(key, {
      value,
      metadata: {
        updatedBy: updater,
        timestamp: new Date(),
        ...metadata,
      },
    }, updater);
  }

  /**
   * Send healthcare compliance notification
   */
  async sendComplianceNotification(
    sender: AgentName,
    complianceType: 'lgpd' | 'anvisa' | 'cfm',
    status: 'compliant' | 'non-compliant' | 'needs-review',
    details: any
  ): Promise<void> {
    const message = this.createMessage(
      sender,
      'broadcast',
      'validation',
      status === 'non-compliant' ? 'critical' : 'medium',
      {
        phase: 'refactor',
        feature: 'healthcare-compliance',
        files: [],
      },
      {
        complianceNotification: {
          type: complianceType,
          status,
          details,
          requiresAction: status !== 'compliant',
          auditTrailRequired: true,
        },
      }
    );

    await this.messageBus.sendMessage(message);
  }

  /**
   * Get communication statistics
   */
  getCommunicationStats(): {
    registeredAgents: number;
    totalMessages: number;
    auditTrailSize: number;
    protocolViolations: number;
    averageMessageSize: number;
    messageBusStats: any;
  } {
    const messageBusStats = this.messageBus.getStatistics();

    const totalMessageSize = this.auditTrail.reduce(
      (sum, msg) => sum + JSON.stringify(msg).length,
      0
    );
    const averageMessageSize = this.auditTrail.length > 0 ?
      totalMessageSize / this.auditTrail.length : 0;

    return {
      registeredAgents: this.registeredAgents.size,
      totalMessages: messageBusStats.totalMessages,
      auditTrailSize: this.auditTrail.length,
      protocolViolations: 0, // TODO: Track violations
      averageMessageSize,
      messageBusStats,
    };
  }

  /**
   * Export audit trail for compliance
   */
  exportAuditTrail(): {
    protocol: string;
    version: string;
    generatedAt: Date;
    totalMessages: number;
    messages: AgentMessage[];
    integrity: string;
  } {
    return {
      protocol: 'AgentCommunicationProtocol',
      version: '1.0.0',
      generatedAt: new Date(),
      totalMessages: this.auditTrail.length,
      messages: [...this.auditTrail],
      integrity: this.calculateAuditIntegrity(),
    };
  }

  // Private helper methods

  private createMessage(
    sender: AgentName,
    receiver: AgentName | 'broadcast',
    type: AgentMessage['type'],
    priority: AgentMessage['priority'],
    context: any,
    payload: any
  ): AgentMessage {
    const message: AgentMessage = {
      sender,
      receiver,
      type,
      priority,
      context,
      payload,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
    };

    // Validate message if strict validation is enabled
    if (this.options.enforceStrictValidation && !this.validateMessage(message)) {
      throw new Error(`Invalid message format from ${sender} to ${receiver}`);
    }

    return message;
  }

  private validateHandshake(handshake: AgentHandshake): boolean {
    return !!(
      handshake.agentName &&
      handshake.capabilities &&
      handshake.capabilities.length > 0 &&
      handshake.version &&
      handshake.supportedProtocols &&
      typeof handshake.healthcareCompliance === 'boolean'
    );
  }

  private validateMessage(message: AgentMessage): boolean {
    // Basic validation
    if (!message.sender || !message.receiver || !message.type || !message.priority) {
      return false;
    }

    // Size validation
    const messageSize = JSON.stringify(message).length;
    if (messageSize > this.options.maxMessageSize!) {
      return false;
    }

    // Content validation based on type
    switch (message.type) {
      case 'analysis':
        return !!(message.payload?.analysis);
      case 'recommendation':
        return !!(message.payload?.recommendation);
      case 'validation':
        return !!(message.payload?.validation);
      case 'coordination':
        return !!(
          message.payload?.coordinationRequest ||
          message.payload?.coordinationResponse ||
          message.payload?.contextRequest ||
          message.payload?.stateChange
        );
      default:
        return true; // Allow other message types
    }
  }

  private hasContextUpdatePermission(agent: AgentHandshake, key: keyof SharedContext): boolean {
    // Define permission matrix
    const permissions: Record<keyof SharedContext, string[]> = {
      featureSpec: ['architect-review', 'tdd-orchestrator'],
      codeChanges: ['code-reviewer', 'tdd-orchestrator'],
      testSuite: ['test', 'tdd-orchestrator'],
      qualityMetrics: ['code-reviewer', 'architect-review', 'tdd-orchestrator'],
      securityFindings: ['security-auditor', 'tdd-orchestrator'],
      architectureDecisions: ['architect-review', 'tdd-orchestrator'],
      complianceStatus: ['security-auditor', 'tdd-orchestrator'],
    };

    return permissions[key]?.includes(agent.agentName) || agent.agentName === 'tdd-orchestrator';
  }

  private setupMessageHandlers(): void {
    // Handle audit trail
    if (this.options.enableAuditTrail) {
      this.messageBus.on('message', (message: AgentMessage) => {
        this.auditTrail.push({ ...message });
        // Keep audit trail size manageable
        if (this.auditTrail.length > 10000) {
          this.auditTrail.splice(0, 1000); // Remove oldest 1000 messages
        }
      });
    }
  }

  private calculateAuditIntegrity(): string {
    // Simple integrity hash - in production, use proper cryptographic hash
    return Buffer.from(JSON.stringify(this.auditTrail.map(m => m.correlationId).sort()))
      .toString('base64');
  }

  private generateCorrelationId(): string {
    return `proto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}