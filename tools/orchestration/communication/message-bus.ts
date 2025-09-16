/**
 * Agent Message Bus - Enables real-time inter-agent communication
 * Supports pub/sub messaging, shared context, and conflict resolution
 */

import { EventEmitter } from 'events';
import {
  AgentMessage,
  AgentName,
  TDDPhase,
  OrchestrationContext,
  QualityControlContext,
} from '../types';

export interface SharedContext {
  featureSpec?: any;
  codeChanges?: any;
  testSuite?: any;
  qualityMetrics?: any;
  securityFindings?: any;
  architectureDecisions?: any;
  complianceStatus?: any;
}

export interface MessageBusOptions {
  enableLogging?: boolean;
  maxMessageHistory?: number;
  messageTimeout?: number;
  enableConflictDetection?: boolean;
}

export class AgentMessageBus extends EventEmitter {
  private sharedContext: SharedContext = {};
  private messageHistory: AgentMessage[] = [];
  private agentStates: Map<AgentName, 'idle' | 'active' | 'waiting' | 'completed' | 'failed'> = new Map();
  private conflicts: Map<string, AgentMessage[]> = new Map();
  private options: MessageBusOptions;

  constructor(options: MessageBusOptions = {}) {
    super();
    this.options = {
      enableLogging: true,
      maxMessageHistory: 1000,
      messageTimeout: 30000,
      enableConflictDetection: true,
      ...options,
    };
  }

  /**
   * Send message from one agent to another or broadcast
   */
  async sendMessage(message: AgentMessage): Promise<void> {
    // Validate message
    if (!this.validateMessage(message)) {
      throw new Error(`Invalid message from ${message.sender}`);
    }

    // Add timestamp and correlation ID if not present
    if (!message.timestamp) {
      message.timestamp = new Date();
    }
    if (!message.correlationId) {
      message.correlationId = this.generateCorrelationId();
    }

    this.log(`📤 Message: ${message.sender} → ${message.receiver} [${message.type}]`);

    // Store in history
    this.addToHistory(message);

    // Detect conflicts if enabled
    if (this.options.enableConflictDetection) {
      this.detectAndStoreConflicts(message);
    }

    // Emit message event
    if (message.receiver === 'broadcast') {
      this.emit('broadcast', message);
      this.emit('message', message);
    } else {
      this.emit(`message:${message.receiver}`, message);
      this.emit('message', message);
    }

    // Handle message timeout
    if (this.options.messageTimeout && message.type !== 'coordination') {
      setTimeout(() => {
        this.emit('message:timeout', message);
      }, this.options.messageTimeout);
    }
  }

  /**
   * Subscribe to messages for specific agent
   */
  subscribeAgent(
    agentName: AgentName,
    handler: (message: AgentMessage) => void | Promise<void>
  ): void {
    this.on(`message:${agentName}`, handler);
    this.on('broadcast', handler);
    this.log(`📬 Agent ${agentName} subscribed to messages`);
  }

  /**
   * Unsubscribe agent from messages
   */
  unsubscribeAgent(agentName: AgentName): void {
    this.removeAllListeners(`message:${agentName}`);
    this.log(`📭 Agent ${agentName} unsubscribed from messages`);
  }

  /**
   * Update shared context
   */
  updateSharedContext(key: keyof SharedContext, value: any, updatedBy: AgentName): void {
    const previousValue = this.sharedContext[key];
    this.sharedContext[key] = value;

    this.log(`🔄 Shared context updated: ${key} by ${updatedBy}`);

    // Emit context update event
    this.emit('context:update', {
      key,
      value,
      previousValue,
      updatedBy,
      timestamp: new Date(),
    });

    // Send context update message to all agents
    this.sendMessage({
      sender: updatedBy,
      receiver: 'broadcast',
      type: 'coordination',
      priority: 'medium',
      context: {
        phase: 'refactor', // Default phase for context updates
        feature: 'shared-context',
        files: [],
      },
      payload: {
        contextUpdate: {
          key,
          value,
          previousValue,
        },
      },
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
    });
  }

  /**
   * Get shared context
   */
  getSharedContext(): SharedContext {
    return { ...this.sharedContext };
  }

  /**
   * Get specific shared context value
   */
  getContextValue<T>(key: keyof SharedContext): T | undefined {
    return this.sharedContext[key] as T;
  }

  /**
   * Update agent state
   */
  updateAgentState(
    agentName: AgentName,
    state: 'idle' | 'active' | 'waiting' | 'completed' | 'failed'
  ): void {
    const previousState = this.agentStates.get(agentName);
    this.agentStates.set(agentName, state);

    this.log(`👤 Agent ${agentName}: ${previousState} → ${state}`);

    // Emit state change event
    this.emit('agent:state', {
      agentName,
      state,
      previousState,
      timestamp: new Date(),
    });

    // Broadcast state change to other agents
    this.sendMessage({
      sender: agentName,
      receiver: 'broadcast',
      type: 'coordination',
      priority: 'low',
      context: {
        phase: 'refactor', // Default phase
        feature: 'agent-coordination',
        files: [],
      },
      payload: {
        stateChange: {
          agentName,
          state,
          previousState,
        },
      },
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
    });
  }

  /**
   * Get agent state
   */
  getAgentState(agentName: AgentName): 'idle' | 'active' | 'waiting' | 'completed' | 'failed' | undefined {
    return this.agentStates.get(agentName);
  }

  /**
   * Get all agent states
   */
  getAllAgentStates(): Map<AgentName, string> {
    return new Map(this.agentStates);
  }

  /**
   * Request coordination from orchestrator
   */
  async requestCoordination(
    requester: AgentName,
    coordinationType: 'conflict-resolution' | 'priority-clarification' | 'resource-allocation',
    details: any
  ): Promise<void> {
    const message: AgentMessage = {
      sender: requester,
      receiver: 'tdd-orchestrator',
      type: 'coordination',
      priority: 'high',
      context: {
        phase: 'refactor', // Default phase
        feature: 'agent-coordination',
        files: [],
      },
      payload: {
        coordinationRequest: {
          type: coordinationType,
          details,
          timestamp: new Date(),
        },
      },
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
    };

    await this.sendMessage(message);
  }

  /**
   * Resolve conflicts between agents
   */
  async resolveConflict(
    conflictKey: string,
    resolution: any,
    resolver: AgentName = 'tdd-orchestrator'
  ): Promise<void> {
    const conflictMessages = this.conflicts.get(conflictKey);
    if (!conflictMessages) {
      this.log(`⚠️ No conflict found with key: ${conflictKey}`);
      return;
    }

    this.log(`🔧 Resolving conflict: ${conflictKey} by ${resolver}`);

    // Send resolution message to all involved agents
    const involvedAgents = [...new Set(conflictMessages.map(m => m.sender))];

    for (const agent of involvedAgents) {
      await this.sendMessage({
        sender: resolver,
        receiver: agent,
        type: 'coordination',
        priority: 'critical',
        context: {
          phase: 'refactor',
          feature: 'conflict-resolution',
          files: [],
        },
        payload: {
          conflictResolution: {
            conflictKey,
            resolution,
            originalMessages: conflictMessages,
          },
        },
        timestamp: new Date(),
        correlationId: this.generateCorrelationId(),
      });
    }

    // Remove resolved conflict
    this.conflicts.delete(conflictKey);
    this.emit('conflict:resolved', { conflictKey, resolution, resolver });
  }

  /**
   * Get message history
   */
  getMessageHistory(filter?: Partial<AgentMessage>): AgentMessage[] {
    if (!filter) {
      return [...this.messageHistory];
    }

    return this.messageHistory.filter(message => {
      return Object.entries(filter).every(([key, value]) => {
        return (message as any)[key] === value;
      });
    });
  }

  /**
   * Get active conflicts
   */
  getActiveConflicts(): Map<string, AgentMessage[]> {
    return new Map(this.conflicts);
  }

  /**
   * Clear message bus (reset state)
   */
  clear(): void {
    this.sharedContext = {};
    this.messageHistory = [];
    this.agentStates.clear();
    this.conflicts.clear();
    this.removeAllListeners();
    this.log('🧹 Message bus cleared');
  }

  /**
   * Get message bus statistics
   */
  getStatistics(): {
    totalMessages: number;
    messagesByType: Record<string, number>;
    messagesByAgent: Record<string, number>;
    activeAgents: number;
    activeConflicts: number;
    sharedContextSize: number;
  } {
    const messagesByType: Record<string, number> = {};
    const messagesByAgent: Record<string, number> = {};

    this.messageHistory.forEach(message => {
      messagesByType[message.type] = (messagesByType[message.type] || 0) + 1;
      messagesByAgent[message.sender] = (messagesByAgent[message.sender] || 0) + 1;
    });

    return {
      totalMessages: this.messageHistory.length,
      messagesByType,
      messagesByAgent,
      activeAgents: this.agentStates.size,
      activeConflicts: this.conflicts.size,
      sharedContextSize: Object.keys(this.sharedContext).length,
    };
  }

  // Private helper methods

  private validateMessage(message: AgentMessage): boolean {
    return !!(
      message.sender &&
      message.receiver &&
      message.type &&
      message.priority &&
      message.context
    );
  }

  private addToHistory(message: AgentMessage): void {
    this.messageHistory.push(message);

    // Trim history if it exceeds max size
    if (this.messageHistory.length > this.options.maxMessageHistory!) {
      this.messageHistory.shift();
    }
  }

  private detectAndStoreConflicts(message: AgentMessage): void {
    // Detect conflicts based on message content
    if (message.type === 'recommendation' || message.type === 'analysis') {
      const conflictKey = `${message.context.feature}:${message.type}`;

      const existingMessages = this.conflicts.get(conflictKey) || [];
      const potentialConflict = existingMessages.find(existing =>
        existing.sender !== message.sender &&
        this.messagesConflict(existing, message)
      );

      if (potentialConflict) {
        this.conflicts.set(conflictKey, [...existingMessages, message]);
        this.emit('conflict:detected', { conflictKey, messages: [...existingMessages, message] });
        this.log(`⚠️ Conflict detected: ${conflictKey}`);
      } else if (!existingMessages.find(m => m.sender === message.sender)) {
        this.conflicts.set(conflictKey, [...existingMessages, message]);
      }
    }
  }

  private messagesConflict(message1: AgentMessage, message2: AgentMessage): boolean {
    // Simple conflict detection - could be enhanced with more sophisticated logic
    if (message1.type !== message2.type) return false;

    // Check if payloads contradict each other
    const payload1 = message1.payload;
    const payload2 = message2.payload;

    if (payload1 && payload2) {
      // Example: conflicting recommendations
      if (payload1.recommendation && payload2.recommendation) {
        return payload1.recommendation !== payload2.recommendation;
      }

      // Example: conflicting quality scores
      if (payload1.qualityScore && payload2.qualityScore) {
        return Math.abs(payload1.qualityScore - payload2.qualityScore) > 2;
      }
    }

    return false;
  }

  private generateCorrelationId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string): void {
    if (this.options.enableLogging) {
      console.log(`[MessageBus] ${message}`);
    }
  }
}