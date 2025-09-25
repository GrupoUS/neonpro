/**
 * Unified Chat Services Types
 * @package @neonpro/chat-services
 */

// Core chat types
export * from './chat';
export * from './healthcare-chat';
export * from './compliance';
export * from './analytics';

// Integration types
export * from './copilotkit';
export * from './agui-protocol';
export * from './websocket';

// Service types
export * from './services';
export * from './providers';

// Legacy compatibility
export type {
  ChatMessage,
  ChatSession,
  ChatSessionMetadata,
  ChatSessionStatus,
  AuditEvent,
  ChatRole
} from '@neonpro/types';