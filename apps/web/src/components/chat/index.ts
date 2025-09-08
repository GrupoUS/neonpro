/**
 * Universal AI Chat System Components
 *
 * Comprehensive chat interface for NeonPro healthcare platform
 * Supports Brazilian Portuguese healthcare communication
 * with LGPD compliance and emergency detection
 */

// Core chat interface components
export { ChatHeader, type ChatHeaderProps, } from './ChatHeader'
export { ChatInput, type ChatInputProps, } from './ChatInput'
export { ChatInterface, type ChatInterfaceProps, } from './ChatInterface'
export { ChatSidebar, type ChatSidebarProps, } from './ChatSidebar'
export { MessageBubble, type MessageBubbleProps, } from './MessageBubble'

// Utility components
export {
  TypingIndicator,
  type TypingIndicatorProps,
  type TypingUser,
  useTypingIndicator,
} from './TypingIndicator'

export { VoiceCommands, type VoiceCommandsProps, type VoiceRecording, } from './VoiceCommands'

// Re-export chat types for convenience
export type {
  AIResponse,
  ChatConversation,
  ChatMessage,
  ConversationType,
  EmergencyContext,
  HealthcareContext,
  LGPDComplianceInfo,
  MessageContent,
  MessageStatus,
  MessageType,
  SenderType,
} from '@/types/chat'
