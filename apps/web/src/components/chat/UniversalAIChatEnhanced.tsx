"use client";

import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Import TweakCN enhanced components
import ChatInput from "./ChatInput";
import ChatInterface, {
  type ChatMessage,
  type ChatSession,
  type HealthcareContext,
} from "./ChatInterface";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface UniversalAIChatEnhancedProps {
  mode?: 'internal' | 'external' | 'emergency';
  userId: string;
  clinicId?: string;
  patientId?: string;
  healthcareContext?: HealthcareContext;
  complianceMode?: 'lgpd-full' | 'lgpd-minimal' | 'emergency-override';
  onEmergencyDetected?: (emergency: boolean) => void;
  onEscalationTriggered?: (escalation: boolean) => void;
  className?: string;
  minimizable?: boolean;
  initialMinimized?: boolean;
}

interface ChatResponse {
  type: "start" | "content" | "complete" | "error";
  content?: string;
  sessionId?: string;
  messageId?: string;
  confidence?: number;
  emergencyDetected?: boolean;
  escalationTriggered?: boolean;
  suggestedActions?: string[];
  complianceFlags?: string[];
  healthcareContext?: {
    specialty?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    procedureType?: string;
  };
  error?: string;
}

export function UniversalAIChatEnhanced({
  mode = "external",
  userId,
  clinicId,
  patientId,
  healthcareContext,
  complianceMode = "lgpd-full",
  onEmergencyDetected,
  onEscalationTriggered,
  className,
  minimizable = false,
  initialMinimized = false,
}: UniversalAIChatEnhancedProps) {
  // State management
  const [session, setSession] = useState<ChatSession | null>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { toast } = useToast();

  // Initialize chat session
  const initializeSession = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      const response = await fetch("/api/ai/universal-chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          mode,
          userId,
          clinicId,
          patientId,
          healthcareContext,
          complianceMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat session");
      }

      const data = await response.json();

      const newSession: ChatSession = {
        id: data.sessionId,
        title: `Chat NeonPro ${mode === 'internal' ? 'Interno' : mode === 'emergency' ? 'Emergência' : 'Paciente'} - ${new Date().toLocaleTimeString("pt-BR")}`,
        status: "active",
        interface: mode,
        messages: [],
        createdAt: new Date(),
        healthcareContext,
      };

      setSession(newSession);
      setConnectionStatus("connected");

      // Add contextual welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: getWelcomeMessage(),
        timestamp: new Date(),
        confidence: 1,
        healthcareContext: {
          specialty: healthcareContext?.specialty,
          severity: 'low',
        },
      };

      setMessages([welcomeMessage]);

      toast({
        title: "💚 Chat NeonPro Conectado",
        description: "Sistema IA carregado com sucesso. Segurança LGPD ativa.",
      });
    } catch (error) {
      setConnectionStatus("disconnected");
      toast({
        title: "❌ Erro de Conexão",
        description: "Não foi possível conectar ao sistema. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [mode, userId, clinicId, patientId, healthcareContext, complianceMode, toast]);

  // Initialize session on mount
  useEffect(() => {
    if (!session) {
      initializeSession();
    }
  }, [session, initializeSession]);

  // Get contextual welcome message
  const getWelcomeMessage = (): string => {
    const specialty = healthcareContext?.specialty;
    const specialtyText = specialty ? ` especializado em ${getSpecialtyName(specialty)}` : "";
    
    switch (mode) {
      case "internal":
        return `🏥 **Assistente IA Interno NeonPro**${specialtyText}\n\n📊 **Funcionalidades disponíveis:**\n• Análises de pacientes e métricas em tempo real\n• Otimização de agenda e gestão de recursos\n• Relatórios de compliance e auditoria LGPD\n• Pesquisas avançadas em históricos médicos\n• Suporte operacional especializado\n\n💼 Como posso auxiliar sua equipe hoje?`;
        
      case "emergency":
        return `🚨 **SISTEMA DE EMERGÊNCIA NEONPRO ATIVO**\n\n⚡ **Status:** Modo de resposta prioritária\n🏥 **Protocolos:** Emergência médica carregados\n📞 **Escalação:** Automática para equipe médica\n🔴 **Prioridade:** Máxima - Resposta < 30 segundos\n\n**Descreva a situação de emergência para acionamento imediato.**`;
        
      default: // external
        return `💚 **Bem-vindo ao Chat NeonPro!**${specialtyText}\n\n🤖 **Seu assistente inteligente para:**\n\n📅 **Agendamentos:** Consultas e reagendamentos\nℹ️ **Informações:** Tratamentos e procedimentos\n💊 **Orientações:** Pré e pós-procedimento\n💳 **Suporte:** Pagamentos e planos de tratamento\n🔍 **Esclarecimentos:** Dúvidas sobre estética e saúde\n\n✨ **Como posso ajudá-lo hoje?**`;
    }
  };

  const getSpecialtyName = (specialty: string): string => {
    switch (specialty) {
      case 'dermatology': return 'Dermatologia';
      case 'aesthetics': return 'Medicina Estética';
      case 'plastic-surgery': return 'Cirurgia Plástica';
      default: return 'Saúde Geral';
    }
  };

  // Send message with streaming response
  const sendMessage = useCallback(
    async (content: string) => {
      if (!(session && content.trim()) || isLoading) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        healthcareContext: {
          specialty: healthcareContext?.specialty,
          severity: 'low',
        },
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsTyping(true);
      setCurrentStreamingMessage("");

      try {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/ai/universal-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp.toISOString(),
              healthcareContext: m.healthcareContext,
            })),
            mode,
            sessionId: session.id,
            userId,
            clinicId,
            patientId,
            healthcareContext,
            complianceMode,
            emergencyContext: mode === 'emergency',
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessageId = "";
        let streamingContent = "";
        let messageHealthcareContext = undefined;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setIsTyping(false);
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                try {
                  const parsedData: ChatResponse = JSON.parse(data);

                  switch (parsedData.type) {
                    case "start": {
                      assistantMessageId = `assistant-${Date.now()}`;
                      messageHealthcareContext = parsedData.healthcareContext;
                      setIsTyping(true);
                      
                      // Handle compliance warnings
                      if (parsedData.complianceFlags && parsedData.complianceFlags.length > 0) {
                        toast({
                          title: "⚠️ Aviso de Conformidade LGPD",
                          description: `${parsedData.complianceFlags.length} avisos: ${parsedData.complianceFlags.join(", ")}`,
                          variant: "destructive",
                        });
                      }
                      break;
                    }

                    case "content": {
                      if (parsedData.content) {
                        streamingContent += parsedData.content;
                        setCurrentStreamingMessage(streamingContent);
                      }
                      break;
                    }

                    case "complete": {
                      const assistantMessage: ChatMessage = {
                        id: assistantMessageId,
                        role: "assistant",
                        content: streamingContent,
                        timestamp: new Date(),
                        confidence: parsedData.confidence,
                        emergencyDetected: parsedData.emergencyDetected,
                        escalationTriggered: parsedData.escalationTriggered,
                        complianceFlags: parsedData.complianceFlags,
                        healthcareContext: messageHealthcareContext,
                      };

                      setMessages((prev) => [...prev, assistantMessage]);
                      setCurrentStreamingMessage("");
                      setIsTyping(false);

                      // Handle emergency detection
                      if (parsedData.emergencyDetected) {
                        onEmergencyDetected?.(true);
                        toast({
                          title: "🚨 EMERGÊNCIA MÉDICA DETECTADA",
                          description: "Equipe médica sendo notificada imediatamente.",
                          variant: "destructive",
                        });
                      }

                      // Handle escalation
                      if (parsedData.escalationTriggered) {
                        onEscalationTriggered?.(true);
                        toast({
                          title: "📞 ESCALAÇÃO AUTOMÁTICA ATIVA",
                          description: "Conectando com profissional de saúde especializado...",
                        });
                      }

                      // Show suggested actions
                      if (parsedData.suggestedActions && parsedData.suggestedActions.length > 0) {
                        toast({
                          title: "💡 Ações Recomendadas",
                          description: parsedData.suggestedActions.join(" • "),
                        });
                      }
                      break;
                    }

                    case "error": {
                      throw new Error(parsedData.error || "Erro desconhecido no sistema IA");
                    }
                  }
                } catch (error) {
                  console.error("Error parsing SSE data:", error);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled
        }

        setCurrentStreamingMessage("");
        setIsTyping(false);

        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Ocorreu um erro temporário no sistema. Nossa equipe técnica foi notificada. Tente novamente em alguns instantes.",
          timestamp: new Date(),
          confidence: 0,
          healthcareContext: {
            severity: 'medium',
          },
        };

        setMessages((prev) => [...prev, errorMessage]);

        toast({
          title: "❌ Erro no Sistema de IA",
          description: error instanceof Error ? error.message : "Erro de comunicação com o servidor.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      session,
      messages,
      isLoading,
      mode,
      userId,
      clinicId,
      patientId,
      healthcareContext,
      complianceMode,
      onEmergencyDetected,
      onEscalationTriggered,
      toast,
    ],
  );

  return (
    <ChatInterface
      mode={mode}
      userId={userId}
      healthcareContext={healthcareContext}
      complianceMode={complianceMode}
      onEmergencyDetected={onEmergencyDetected}
      onEscalationTriggered={onEscalationTriggered}
      className={className}
      minimizable={minimizable}
      initialMinimized={initialMinimized}
    >
      {/* Render Messages */}
      <AnimatePresence>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showConfidence={mode !== 'emergency'}
            showTimestamp={true}
          />
        ))}

        {/* Streaming Message */}
        {currentStreamingMessage && (
          <MessageBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: currentStreamingMessage,
              timestamp: new Date(),
              healthcareContext: {
                specialty: healthcareContext?.specialty,
                severity: 'low',
              },
            }}
            showConfidence={false}
            showTimestamp={false}
          />
        )}

        {/* Typing Indicator */}
        {(isTyping && !currentStreamingMessage) && (
          <TypingIndicator
            isVisible={true}
            typingUser={{
              name: "Assistente IA NeonPro",
              role: "assistant",
              specialty: healthcareContext?.specialty,
            }}
            mode={mode}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Chat Input */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        disabled={connectionStatus !== "connected"}
        mode={mode}
        maxLength={mode === 'emergency' ? 500 : 1000}
        showVoiceControls={true}
        showFileUpload={mode !== 'emergency'}
        showEmergencyActions={mode === 'emergency'}
      />
    </ChatInterface>
  );
}

export default UniversalAIChatEnhanced;