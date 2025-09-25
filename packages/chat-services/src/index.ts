/**
 * Unified Chat Services - Healthcare-optimized chat functionality
 * @package `@neonpro/chat-services`
 */

// Main unified service
export { UnifiedChatService } from './services/UnifiedChatService'

// Healthcare chat services
export {
  ClinicalChatService,
  AestheticChatService,
  PatientEducationChatService,
  EmergencyChatService
} from './services/healthcare'

// Supporting services
export {
  HealthcareComplianceService
} from './compliance'

export {
  ChatAnalyticsService
} from './analytics'

export {
  AGUIProtocolService
} from './agui-protocol'

export {
  WebSocketService
} from './websocket'

export {
  CopilotKitIntegrationService
} from './copilotkit'

// Repositories (absorbed from chat-domain)
export {
  ChatRepository,
  createChatRepository,
  getChatRepository
} from './repositories/ChatRepository'

export {
  SessionRepo
} from './repositories/SessionRepo'

// Types
export * from './types'

// Schemas (absorbed from chat-domain)
export * from './schemas/chat-domain'

// Error types
export {
  ChatServiceError,
  ChatServiceResponse
} from './types/chat'