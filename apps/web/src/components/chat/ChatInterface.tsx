/**
 * ChatInterface - Main AI Chat System Component
 * Complete chat interface with Brazilian healthcare integration
 * TweakCN NEONPRO theme integration with real-time messaging
 */

"use client";

import { cn } from "@/lib/utils";
import type {
  ChatConversation,
  ChatMessage,
  HealthcareContext,
  MessageType,
  PresenceStatus,
  SenderType,
} from "@/types/chat";
import { ConversationType } from "@/types/chat";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

// Icons (would be imported from lucide-react or similar)
const MessageCircleIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.126-.9L3 20l1.9-5.874A9.863 9.863 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
    />
  </svg>
);

const StethoscopeIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l6 6 6-6z"
    />
  </svg>
);

export interface ChatInterfaceProps {
  currentUserId: string;
  userType: SenderType;
  healthcareContext?: HealthcareContext;
  onConversationChange?: (conversation: ChatConversation | null) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onEmergencyDetected?: (message: ChatMessage) => void;
  className?: string;
  theme?: "light" | "dark";
  aiEnabled?: boolean;
  emergencyMode?: boolean;
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  typingUsers: string[];
  presenceStatus: Record<string, PresenceStatus>;
}

export default function ChatInterface({
  currentUserId,
  userType,
  healthcareContext,
  onConversationChange,
  onMessageSent,
  onEmergencyDetected,
  className,
  theme = "light",
  aiEnabled = true,
  emergencyMode = false,
}: ChatInterfaceProps) {
  // State Management
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: {},
    isLoading: true,
    error: null,
    sidebarCollapsed: false,
    typingUsers: [],
    presenceStatus: {},
  });

  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Theme classes for TweakCN integration
  const themeClasses = {
    light: {
      background: "bg-white dark:bg-gray-900",
      border: "border-gray-200 dark:border-gray-700",
      text: "text-gray-900 dark:text-gray-100",
      healthcare: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      ai: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      emergency: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    },
    dark: {
      background: "bg-gray-900 dark:bg-gray-950",
      border: "border-gray-700 dark:border-gray-600",
      text: "text-gray-100 dark:text-gray-50",
      healthcare: "bg-green-950 dark:bg-green-900 border-green-800 dark:border-green-700",
      ai: "bg-blue-950 dark:bg-blue-900 border-blue-800 dark:border-blue-700",
      emergency: "bg-red-950 dark:bg-red-900 border-red-800 dark:border-red-700",
    },
  };

  const currentTheme = themeClasses[theme];

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial conversations and messages
  useEffect(() => {
    loadConversations();
  }, [currentUserId, healthcareContext]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (state.activeConversation) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages, state.activeConversation?.id, scrollToBottom]);

  // Mock data loading functions (would be replaced with real API calls)
  const loadConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock conversation data
      const mockConversations: ChatConversation[] = [
        {
          id: "conv-1",
          type: "ai_assistant",
          title: "Assistente IA - NeonPro",
          participants: [
            {
              user_id: currentUserId,
              user_type: userType,
              display_name: "Você",
              presence_status: "online",
              last_seen: new Date().toISOString(),
              permissions: {
                can_send_messages: true,
                can_send_files: true,
                can_access_medical_records: userType === "doctor",
                can_prescribe: userType === "doctor",
                can_escalate_emergency: true,
                can_export_conversation: true,
                can_delete_messages: true,
              },
              lgpd_consent: {
                consent_id: "consent-1",
                patient_id: currentUserId,
                consent_level: "full",
                granted_at: new Date().toISOString(),
                purposes: ["medical_treatment", "emergency_care"],
                data_categories: ["health_data", "communication_content"],
                third_party_sharing: false,
                right_to_portability: true,
                right_to_erasure: true,
              },
            },
            {
              user_id: "ai-assistant",
              user_type: "ai_assistant",
              display_name: "Assistente NeonPro",
              avatar_url: "/images/ai-avatar.png",
              presence_status: "online",
              last_seen: new Date().toISOString(),
              permissions: {
                can_send_messages: true,
                can_send_files: false,
                can_access_medical_records: true,
                can_prescribe: false,
                can_escalate_emergency: true,
                can_export_conversation: false,
                can_delete_messages: false,
              },
              lgpd_consent: {
                consent_id: "ai-consent",
                patient_id: "ai-assistant",
                consent_level: "functional",
                granted_at: new Date().toISOString(),
                purposes: ["medical_treatment"],
                data_categories: ["communication_content"],
                third_party_sharing: false,
                right_to_portability: false,
                right_to_erasure: false,
              },
            },
          ],
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          healthcare_context: healthcareContext,
          lgpd_consent_level: "full",
          privacy_settings: {
            end_to_end_encryption: true,
            message_retention_days: 90,
            auto_delete_enabled: false,
            screenshot_prevention: true,
            watermark_enabled: true,
            audit_trail_enabled: true,
            anonymization_level: "none",
          },
          ai_enabled: aiEnabled,
        },
      ];

      // Mock messages for AI conversation
      const mockMessages: Record<string, ChatMessage[]> = {
        "conv-1": [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            sender_id: "ai-assistant",
            sender_type: "ai_assistant",
            message_type: "text",
            content: {
              text:
                "Olá! Sou o assistente IA da NeonPro. Como posso ajudá-lo hoje com suas questões de saúde e estética?",
              ai_response: {
                ai_model: "neonpro-assistant",
                confidence_score: 0.95,
                response_type: "information",
                medical_accuracy_validated: true,
                brazilian_context: {
                  state: "SP",
                  municipality: "São Paulo",
                  cultural_considerations: [
                    {
                      consideration_type: "language",
                      description: "Comunicação em português brasileiro",
                      impact_on_treatment: "Melhor compreensão e adesão ao tratamento",
                      recommended_approach: "Usar terminologia médica acessível",
                    },
                  ],
                },
              },
            },
            metadata: {
              priority: "normal",
              healthcare_context: healthcareContext,
            },
            status: "delivered",
            ai_processed: true,
            ai_confidence: 0.95,
            created_at: new Date(Date.now() - 300_000).toISOString(),
            updated_at: new Date(Date.now() - 300_000).toISOString(),
            lgpd_compliant: true,
          },
        ],
      };

      setState((prev) => ({
        ...prev,
        conversations: mockConversations,
        messages: mockMessages,
        activeConversation: mockConversations[0],
        isLoading: false,
      }));

      // Notify parent component
      onConversationChange?.(mockConversations[0]);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Erro ao carregar conversas. Tente novamente.",
        isLoading: false,
      }));
    }
  }, [
    currentUserId,
    userType,
    healthcareContext,
    aiEnabled,
    onConversationChange,
  ]);

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    (conversation: ChatConversation) => {
      setState((prev) => ({
        ...prev,
        activeConversation: conversation,
      }));
      onConversationChange?.(conversation);
    },
    [onConversationChange],
  );

  // Handle message sending
  const handleMessageSend = useCallback(
    async (messageContent: string, messageType: MessageType = "text") => {
      if (!state.activeConversation || !messageContent.trim()) {
        return;
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: state.activeConversation.id,
        sender_id: currentUserId,
        sender_type: userType,
        message_type: messageType,
        content: {
          text: messageContent.trim(),
        },
        metadata: {
          priority: "normal",
          healthcare_context: healthcareContext,
        },
        status: "sending",
        ai_processed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lgpd_compliant: true,
      };

      // Add message to local state immediately
      setState((prev) => {
        const activeId = state.activeConversation?.id;
        if (!activeId) return prev;
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [activeId]: [
              ...(prev.messages[activeId] || []),
              newMessage,
            ],
          },
        };
      });

      // Notify parent
      onMessageSent?.(newMessage);

      try {
        // TODO: Send message via API
        // await sendMessage(newMessage);

        // Update message status to sent
        setState((prev) => {
          const activeId = state.activeConversation?.id;
          if (!activeId) return prev;
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [activeId]: prev.messages[activeId]?.map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
              ) || [],
            },
          };
        });

        // Mock AI response if AI is enabled
        if (aiEnabled && state.activeConversation.ai_enabled) {
          setTimeout(() => {
            const aiResponse: ChatMessage = {
              id: `ai-${Date.now()}`,
              conversation_id: state.activeConversation?.id || "",
              sender_id: "ai-assistant",
              sender_type: "ai_assistant",
              message_type: "text",
              content: {
                text:
                  "Entendi sua mensagem. Com base no que você descreveu, posso fornecer algumas informações gerais. Para um diagnóstico preciso, recomendo uma consulta com um profissional médico. Gostaria que eu agende uma consulta para você?",
                ai_response: {
                  ai_model: "neonpro-assistant",
                  confidence_score: 0.87,
                  response_type: "recommendation",
                  medical_accuracy_validated: true,
                  suggested_actions: [
                    {
                      action_type: "schedule_appointment",
                      priority: "medium",
                      description: "Agendar consulta médica para avaliação presencial",
                      parameters: {
                        specialty: healthcareContext?.medical_specialty
                          || "clinica_medica",
                        urgency: "routine",
                      },
                    },
                  ],
                },
              },
              metadata: {
                reply_to: newMessage.id,
                priority: "normal",
                healthcare_context: healthcareContext,
              },
              status: "delivered",
              ai_processed: true,
              ai_confidence: 0.87,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              lgpd_compliant: true,
            };

            setState((prev) => {
              const activeId = state.activeConversation?.id;
              if (!activeId) return prev;
              return {
                ...prev,
                messages: {
                  ...prev.messages,
                  [activeId]: [
                    ...prev.messages[activeId],
                    aiResponse,
                  ],
                },
              };
            });
          }, 2000);
        }
      } catch (error) {
        // Update message status to failed
        setState((prev) => {
          const activeId = state.activeConversation?.id;
          if (!activeId) return prev;
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [activeId]: prev.messages[activeId]?.map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
              ) || [],
            },
          };
        });
      }
    },
    [
      state.activeConversation,
      currentUserId,
      userType,
      healthcareContext,
      onMessageSent,
      aiEnabled,
    ],
  );

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  }, []);

  // Loading state
  if (state.isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full",
          currentTheme.background,
          currentTheme.text,
          className,
        )}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="ml-3">Carregando conversas...</span>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full",
          currentTheme.background,
          currentTheme.text,
          className,
        )}
      >
        <div className="text-red-500 mb-4">❌ Erro</div>
        <p className="text-center mb-4">{state.error}</p>
        <button
          onClick={loadConversations}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const currentMessages = state.activeConversation
    ? state.messages[state.activeConversation.id] || []
    : [];

  return (
    <div
      className={cn(
        "flex h-full max-h-screen",
        currentTheme.background,
        emergencyMode && currentTheme.emergency,
        className,
      )}
    >
      {/* Sidebar */}
      <ChatSidebar
        conversations={state.conversations}
        activeConversation={state.activeConversation}
        onConversationSelect={handleConversationSelect}
        collapsed={state.sidebarCollapsed}
        onToggle={toggleSidebar}
        presenceStatus={state.presenceStatus}
        emergencyMode={emergencyMode}
        className={cn("transition-all duration-300", {
          "w-80": !state.sidebarCollapsed,
          "w-16": state.sidebarCollapsed,
        })}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {state.activeConversation
          ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                conversation={state.activeConversation}
                presenceStatus={state.presenceStatus}
                onToggleSidebar={toggleSidebar}
                sidebarCollapsed={state.sidebarCollapsed}
                emergencyMode={emergencyMode}
                className={cn("border-b", currentTheme.border)}
              />

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {currentMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    showAvatar
                    showTimestamp
                    emergencyMode={emergencyMode}
                    className="animate-in slide-in-from-bottom-2 duration-300"
                  />
                ))}

                {/* Typing Indicator */}
                {state.typingUsers.length > 0 && (
                  <TypingIndicator
                    typingUsers={state.typingUsers}
                    conversation={state.activeConversation}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleMessageSend}
                disabled={false}
                placeholder={aiEnabled
                  ? "Digite sua mensagem... O assistente IA está pronto para ajudar!"
                  : "Digite sua mensagem..."}
                healthcareContext={healthcareContext}
                emergencyMode={emergencyMode}
                className={cn("border-t", currentTheme.border)}
              />
            </>
          )
          : (
            /* No Conversation Selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div
                className={cn(
                  "p-6 rounded-full mb-6",
                  aiEnabled ? currentTheme.ai : currentTheme.healthcare,
                )}
              >
                {aiEnabled
                  ? <MessageCircleIcon className="w-12 h-12 text-blue-600" />
                  : <StethoscopeIcon className="w-12 h-12 text-green-600" />}
              </div>

              <h3 className={cn("text-xl font-semibold mb-2", currentTheme.text)}>
                {aiEnabled ? "Assistente IA NeonPro" : "Chat NeonPro"}
              </h3>

              <p
                className={cn(
                  "text-gray-600 dark:text-gray-400 mb-6 max-w-md",
                  currentTheme.text,
                )}
              >
                {aiEnabled
                  ? "Converse com nosso assistente IA especializado em saúde e estética. Tire dúvidas, agende consultas e receba orientações personalizadas."
                  : "Selecione uma conversa para começar a trocar mensagens com profissionais de saúde."}
              </p>

              {aiEnabled && (
                <div
                  className={cn(
                    "p-4 rounded-lg border-2 border-dashed",
                    currentTheme.ai,
                    "border-blue-300 dark:border-blue-700",
                  )}
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Dica:</strong>{" "}
                    O assistente pode ajudar com informações gerais sobre saúde, mas sempre procure
                    um profissional médico para diagnósticos específicos.
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
