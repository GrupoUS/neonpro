/**
 * Conversation Services Index
 *
 * Exports all conversation-related services for AI agent integration
 */

export { ConversationContextService } from './conversation-context-service'

// Re-export types for convenience
export type {
  ContextAnalytics,
  ContextSearchOptions,
  ConversationContext,
  ConversationMessage,
} from './conversation-context-service'

// Default export for easy importing
export default ConversationContextService
