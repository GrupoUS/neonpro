import { EventEmitter } from 'events';
import type {
  AgentMessage,
  AgentName,
  MessageType,
  Priority,
  TDDPhase,
  OrchestrationState
} from './types';

/**
 * Inter-Agent Communication System
 * Manages message passing, state synchronization, and coordination between agents
 */
export class CommunicationSystem extends EventEmitter {
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private agentStates: Map<string, any> = new Map();
  private orchestrationStates: Map<string, OrchestrationState> = new Map();
  private maxRetries: number;
  private timeout: number;
  private bufferSize: number;

  constructor(config: {
    maxRetries: number;
    timeout: number;
    bufferSize: number;
  }) {
    super();
    this.maxRetries = config.maxRetries;
    this.timeout = config.timeout;
    this.bufferSize = config.bufferSize;
  }

  /**
   * Send message between agents
   */
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date()
    };

    // Add to queue for receiver
    const receiverQueue = this.messageQueue.get(message.receiver) || [];
    receiverQueue.push(fullMessage);
    
    // Maintain buffer size
    if (receiverQueue.length > this.bufferSize) {
      receiverQueue.shift(); // Remove oldest message
    }
    
    this.messageQueue.set(message.receiver, receiverQueue);

    // Emit message event
    this.emit('message-sent', fullMessage);

    // Handle broadcast messages
    if (message.receiver === 'broadcast') {
      await this.broadcastMessage(fullMessage);
    }

    return fullMessage.id;
  }

  /**
   * Receive messages for a specific agent
   */
  async receiveMessages(agent: AgentName | 'orchestrator'): Promise<AgentMessage[]> {
    const messages = this.messageQueue.get(agent) || [];
    this.messageQueue.set(agent, []); // Clear queue after reading
    
    return messages.sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  /**
   * Broadcast message to all agents
   */
  private async broadcastMessage(message: AgentMessage): Promise<void> {
    const agents: (AgentName | 'orchestrator')[] = [
      'test', 'code-reviewer', 'architect-review', 'security-auditor', 'orchestrator'
    ];

    for (const agent of agents) {
      if (agent !== message.sender) {
        const agentQueue = this.messageQueue.get(agent) || [];
        agentQueue.push({ ...message, receiver: agent });
        this.messageQueue.set(agent, agentQueue);
      }
    }
  }

  /**
   * Update agent state
   */
  async updateAgentState(agent: AgentName, state: any): Promise<void> {
    this.agentStates.set(agent, {
      ...this.agentStates.get(agent),
      ...state,
      lastUpdated: new Date()
    });

    this.emit('agent-state-updated', { agent, state });
  }

  /**
   * Get agent state
   */
  async getAgentState(agent: AgentName): Promise<any> {
    return this.agentStates.get(agent) || {};
  }

  /**
   * Update orchestration state
   */
  async updateOrchestrationState(
    orchestrationId: string, 
    updates: Partial<OrchestrationState>
  ): Promise<void> {
    const currentState = this.orchestrationStates.get(orchestrationId);
    
    if (!currentState) {
      throw new Error(`Orchestration state not found: ${orchestrationId}`);
    }

    const updatedState: OrchestrationState = {
      ...currentState,
      ...updates,
      updatedAt: new Date()
    };

    this.orchestrationStates.set(orchestrationId, updatedState);
    this.emit('orchestration-state-updated', { orchestrationId, state: updatedState });
  }

  /**
   * Get orchestration state
   */
  async getOrchestrationState(orchestrationId: string): Promise<OrchestrationState | null> {
    return this.orchestrationStates.get(orchestrationId) || null;
  }

  /**
   * Initialize orchestration state
   */
  async initializeOrchestrationState(state: OrchestrationState): Promise<void> {
    this.orchestrationStates.set(state.id, state);
    this.emit('orchestration-initialized', state);
  }

  /**
   * Create coordination message for phase transition
   */
  async createPhaseTransitionMessage(
    orchestrationId: string,
    fromPhase: TDDPhase,
    toPhase: TDDPhase,
    context: any
  ): Promise<string> {
    return this.sendMessage({
      sender: 'orchestrator',
      receiver: 'broadcast',
      type: 'analysis',
      priority: 'high',
      context: {
        phase: toPhase,
        feature: context.feature?.name || 'unknown',
        files: context.files || [],
        iteration: context.iteration || 1
      },
      payload: {
        type: 'phase-transition',
        orchestrationId,
        fromPhase,
        toPhase,
        timestamp: new Date(),
        context
      }
    });
  }

  /**
   * Create agent coordination message
   */
  async createAgentCoordinationMessage(
    sender: AgentName | 'orchestrator',
    receiver: AgentName,
    phase: TDDPhase,
    coordinationType: 'handoff' | 'collaboration' | 'validation',
    payload: any
  ): Promise<string> {
    return this.sendMessage({
      sender,
      receiver,
      type: 'analysis',
      priority: 'medium',
      context: {
        phase,
        feature: payload.feature || 'unknown',
        files: payload.files || [],
        iteration: payload.iteration || 1
      },
      payload: {
        type: 'agent-coordination',
        coordinationType,
        ...payload
      }
    });
  }

  /**
   * Create quality gate notification
   */
  async createQualityGateNotification(
    orchestrationId: string,
    phase: TDDPhase,
    gateResults: any,
    passed: boolean
  ): Promise<string> {
    return this.sendMessage({
      sender: 'orchestrator',
      receiver: 'broadcast',
      type: passed ? 'validation' : 'error',
      priority: passed ? 'medium' : 'high',
      context: {
        phase,
        feature: 'quality-gate',
        files: [],
        iteration: 1
      },
      payload: {
        type: 'quality-gate-result',
        orchestrationId,
        phase,
        gateResults,
        passed,
        timestamp: new Date()
      }
    });
  }

  /**
   * Get message statistics
   */
  getMessageStats(): Record<string, any> {
    const stats = {
      totalQueues: this.messageQueue.size,
      totalMessages: 0,
      messagesByAgent: {} as Record<string, number>,
      messagesByPriority: { critical: 0, high: 0, medium: 0, low: 0 }
    };

    this.messageQueue.forEach((messages, agent) => {
      stats.totalMessages += messages.length;
      stats.messagesByAgent[agent] = messages.length;
      
      messages.forEach(msg => {
        stats.messagesByPriority[msg.priority]++;
      });
    });

    return stats;
  }

  /**
   * Clear message queues (for cleanup)
   */
  clearQueues(): void {
    this.messageQueue.clear();
    this.emit('queues-cleared');
  }

  /**
   * Clear orchestration state (for cleanup)
   */
  clearOrchestrationState(orchestrationId: string): void {
    this.orchestrationStates.delete(orchestrationId);
    this.emit('orchestration-state-cleared', { orchestrationId });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Health check for communication system
   */
  healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
  } {
    const stats = this.getMessageStats();
    const queueSizes = Object.values(stats.messagesByAgent) as number[];
    const maxQueueSize = Math.max(...queueSizes, 0);
    const avgQueueSize = queueSizes.length > 0 ? 
      queueSizes.reduce((a: number, b: number) => a + b, 0) / queueSizes.length : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (maxQueueSize > this.bufferSize * 0.8) {
      status = 'degraded';
    }
    
    if (maxQueueSize >= this.bufferSize) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        ...stats,
        maxQueueSize,
        avgQueueSize,
        bufferUtilization: maxQueueSize / this.bufferSize,
        activeOrchestrations: this.orchestrationStates.size
      }
    };
  }
}

/**
 * Message builder utility
 */
export class MessageBuilder {
  private message: Partial<AgentMessage> = {};

  static create(): MessageBuilder {
    return new MessageBuilder();
  }

  from(sender: AgentName | 'orchestrator'): MessageBuilder {
    this.message.sender = sender;
    return this;
  }

  to(receiver: AgentName | 'orchestrator' | 'broadcast'): MessageBuilder {
    this.message.receiver = receiver;
    return this;
  }

  type(messageType: MessageType): MessageBuilder {
    this.message.type = messageType;
    return this;
  }

  priority(priority: Priority): MessageBuilder {
    this.message.priority = priority;
    return this;
  }

  context(phase: TDDPhase, feature: string, files: string[] = [], iteration: number = 1): MessageBuilder {
    this.message.context = { phase, feature, files, iteration };
    return this;
  }

  payload(data: Record<string, any>): MessageBuilder {
    this.message.payload = data;
    return this;
  }

  build(): Omit<AgentMessage, 'id' | 'timestamp'> {
    if (!this.message.sender || !this.message.receiver || !this.message.type || 
        !this.message.priority || !this.message.context || !this.message.payload) {
      throw new Error('Incomplete message: missing required fields');
    }

    return this.message as Omit<AgentMessage, 'id' | 'timestamp'>;
  }
}

/**
 * Default communication configuration
 */
export const defaultCommunicationConfig = {
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  bufferSize: 100
};