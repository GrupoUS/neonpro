/**
 * Chat Components - TweakCN NEONPRO Integration
 * Enhanced healthcare chat interface components with Brazilian compliance
 */

// Core Components
export { default as ChatInterface } from './ChatInterface';
export { default as MessageBubble } from './MessageBubble';
export { default as ChatInput } from './ChatInput';
export { default as TypingIndicator } from './TypingIndicator';

// Legacy Component (for backward compatibility)
export { default as UniversalAIChat } from '../../app/components/chat/universal-ai-chat';

// Types and Interfaces
export type {
  ChatMessage,
  ChatSession,
  HealthcareContext,
} from './ChatInterface';

// Re-export enhanced components for easy access
export {
  ChatInterface as TweakCNChat,
  MessageBubble as TweakCNMessageBubble,
  ChatInput as TweakCNInput,
  TypingIndicator as TweakCNTyping,
} from './ChatInterface';

// Component presets for different healthcare contexts
export const ChatPresets = {
  PatientChat: {
    mode: 'external' as const,
    showVoiceControls: true,
    showFileUpload: true,
    complianceMode: 'lgpd-full' as const,
  },
  StaffChat: {
    mode: 'internal' as const,
    showVoiceControls: true,
    showFileUpload: true,
    complianceMode: 'lgpd-minimal' as const,
  },
  EmergencyChat: {
    mode: 'emergency' as const,
    showEmergencyActions: true,
    complianceMode: 'emergency-override' as const,
  },
} as const;