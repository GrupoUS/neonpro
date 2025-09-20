/**
 * AI Chat Components Index
 *
 * Main export file for AI chat components.
 * Includes all components, types, and utilities for the AI chat interface.
 */

// Main Components
export { EnhancedAIChat } from "./enhanced-ai-chat";
export { AIChatInput } from "./ai-chat-input";
export { AIMessageDisplay } from "./ai-message-display";

// Legacy Component (for backward compatibility)
export { default as AIChat } from "./ai-chat";

// Types
export type * from "./ai-chat-types";

// Utilities
export { formatDateTime } from "@/utils/brazilian-formatters";

// Version
export const AI_CHAT_COMPONENTS_VERSION = "1.0.0";

// Component metadata
export const COMPONENT_INFO = {
  EnhancedAIChat: {
    name: "Enhanced AI Chat",
    description: "Comprehensive AI chat interface with healthcare compliance",
    features: [
      "AI SDK integration",
      "tRPC agent backend",
      "Voice input",
      "File attachments",
      "Search functionality",
      "LGPD compliance",
      "Mobile optimization",
      "Accessibility features",
    ],
    dependencies: ["@ai-sdk/react", "@trpc/react-query", "lucide-react"],
  },
  AIChatInput: {
    name: "AI Chat Input",
    description:
      "Enhanced input component with voice and file attachment capabilities",
    features: [
      "Auto-resizing textarea",
      "Voice recognition",
      "File attachments",
      "Model selection",
      "Search integration",
      "Healthcare indicators",
    ],
  },
  AIMessageDisplay: {
    name: "AI Message Display",
    description:
      "Message display component with streaming and markdown support",
    features: [
      "Streaming text",
      "Markdown rendering",
      "Source citations",
      "Message actions",
      "Accessibility features",
      "Mobile optimization",
    ],
  },
};

// Default exports
export default EnhancedAIChat;
