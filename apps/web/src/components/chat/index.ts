/**
 * Universal AI Chat System Components
 *
 * Comprehensive chat interface for NeonPro healthcare platform
 * Supports Brazilian Portuguese healthcare communication
 * with LGPD compliance and emergency detection
 */

// Core chat interface components
export { ChatInterface, type ChatInterfaceProps } from "./ChatInterface";
export { MessageBubble, type MessageBubbleProps } from "./MessageBubble";
export { ChatInput, type ChatInputProps } from "./ChatInput";
export { ChatHeader, type ChatHeaderProps } from "./ChatHeader";
export { ChatSidebar, type ChatSidebarProps } from "./ChatSidebar";

// Utility components
export {
  TypingIndicator,
  type TypingIndicatorProps,
  type TypingUser,
  useTypingIndicator,
} from "./TypingIndicator";

export {
  VoiceCommands,
  type VoiceCommandsProps,
  type VoiceRecording,
} from "./VoiceCommands";

// Re-export chat types for convenience
export type {
  ChatMessage,
  ChatConversation,
  MessageContent,
  SenderType,
  MessageType,
  ConversationType,
  MessageStatus,
  HealthcareContext,
  AIResponse,
  EmergencyContext,
  LGPDComplianceInfo,
} from "@/types/chat";
