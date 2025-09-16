/**
 * Agent Communication Module
 * Exports all communication-related classes and interfaces
 */

export {
  AgentMessageBus,
  type SharedContext,
  type MessageBusOptions,
} from './message-bus';

export {
  AgentCommunicationProtocol,
  type ProtocolOptions,
  type AgentHandshake,
  type CoordinationRequest,
  type CoordinationResponse,
} from './agent-protocol';

// Re-export relevant types from the main types file
export type {
  AgentMessage,
  AgentName,
  TDDPhase,
  OrchestrationContext,
  AgentResult,
  QualityControlContext,
} from '../types';

/**
 * Convenience function to create a complete communication system
 */
export function createCommunicationSystem(options?: {
  messageBusOptions?: MessageBusOptions;
  protocolOptions?: ProtocolOptions;
}) {
  const messageBus = new AgentMessageBus(options?.messageBusOptions);
  const protocol = new AgentCommunicationProtocol(messageBus, options?.protocolOptions);

  return {
    messageBus,
    protocol,

    // Convenience methods
    async initialize() {
      // Agent communication system initialized
      return { messageBus, protocol };
    },

    async shutdown() {
      messageBus.clear();
      // Agent communication system shut down
    },

    getSystemStats() {
      const protocolStats = protocol.getCommunicationStats();
      const busStats = messageBus.getStatistics();

      return {
        protocol: protocolStats,
        messageBus: busStats,
        health: {
          registeredAgents: protocolStats.registeredAgents,
          activeConflicts: busStats.activeConflicts,
          messagesThroughput: busStats.totalMessages,
        },
      };
    },
  };
}