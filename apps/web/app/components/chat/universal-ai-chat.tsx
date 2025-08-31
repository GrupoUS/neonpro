"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Clock,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  Send,
  Shield,
  User,
  Volume2,
  VolumeX,
  Phone,
  PhoneCall,
  Zap,
  TrendingUp,
  Gauge,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEmergencyVoiceCommands } from "@/hooks/use-emergency-voice-commands";
import { useEmergencyPerformance } from "@/hooks/use-emergency-performance";
import { MedicalTerm } from "@/components/accessibility/medical-term";
import { useKeyboardNavigation } from "@/src/hooks/accessibility/use-keyboard-navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  confidence?: number;
  emergencyDetected?: boolean;
  escalationTriggered?: boolean;
  complianceFlags?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  status: "active" | "archived";
  interface: "external" | "internal";
  messages: ChatMessage[];
  createdAt: Date;
}

interface UniversalAIChatProps {
  interface?: "external" | "internal";
  userId?: string;
  clinicId?: string;
  patientId?: string;
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
  error?: string;
}

export function UniversalAIChat({
  interface: interfaceType = "external",
  userId,
  clinicId,
  patientId,
  onEmergencyDetected,
  onEscalationTriggered,
  className,
  minimizable = false,
  initialMinimized = false,
}: UniversalAIChatProps) {
  // State management
  const [session, setSession] = useState<ChatSession | null>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { toast } = useToast();

  // Emergency Voice Commands Hook
  const {
    recognition,
    synthesis,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
    announceEmergency,
    isVoiceSupported,
    isActive: isVoiceActive,
  } = useEmergencyVoiceCommands({
    onEmergencyDetected: (intent, transcript) => {
      setEmergencyMode(true);
      
      // Activate emergency performance optimization
      activatePerformanceMode();
      
      // Immediately notify parent components
      if (intent === "emergency") {
        onEmergencyDetected?.(true);
        
        // Send emergency message automatically
        const emergencyMessage = `🚨 EMERGÊNCIA DETECTADA: ${transcript}`;
        sendMessage(emergencyMessage);
        
        // Announce emergency protocol with performance status
        const performanceStatus = getPerformanceStatus();
        const announcement = `Emergência detectada. Modo alta performance ativado. Conectando com equipe médica imediatamente. Tempo de resposta otimizado para ${performanceStatus.targetLatency}ms.`;
        announceEmergency(announcement);
        
        toast({
          title: "⚡ Emergency Performance Activated",
          description: `Modo de emergência ativo. Latência otimizada: ${currentLatency}ms`,
          variant: "default",
        });
      } else if (intent === "call_doctor") {
        onEscalationTriggered?.(true);
        sendMessage(`📞 Solicitação de médico: ${transcript}`);
      }
    },
    onCommandExecuted: (command, intent) => {
      // Handle non-emergency voice commands
      if (intent === "symptoms") {
        sendMessage(`Sintomas reportados por voz: ${command}`);
      } else if (intent === "medication") {
        sendMessage(`Consulta sobre medicação: ${command}`);
      } else if (intent === "pain") {
        setEmergencyMode(true);
        sendMessage(`🚨 DOR SEVERA REPORTADA: ${command}`);
        onEmergencyDetected?.(true);
      }
    },
    enableContinuousListening: interfaceType === "external" && emergencyMode,
    emergencyThreshold: 0.6, // Lower threshold for emergency detection
    language: "pt-BR",
  });

  // Emergency Performance Optimization Hook
  const {
    isOptimized,
    currentLatency,
    emergencyQueuePosition,
    isOfflineReady,
    performanceMetrics,
    activateEmergencyMode: activatePerformanceMode,
    deactivateEmergencyMode: deactivatePerformanceMode,
    getPerformanceStatus,
    isEmergencyModeActive,
    edgeNodeStatus,
  } = useEmergencyPerformance({
    enabled: true,
    autoActivateOnEmergency: true,
    targetLatency: 200, // <200ms for emergency scenarios
    enableOfflineMode: interfaceType === "external",
    clinicId: clinicId || "default",
    userId: userId || "anonymous",
    onPerformanceChange: (metrics) => {
      // Log performance changes for monitoring
      if (metrics.latency > 300) {
        toast({
          title: "⚠️ Performance Alert",
          description: `Latência alta detectada: ${metrics.latency}ms`,
          variant: "destructive",
        });
      }
    },
  });

  // Keyboard navigation and accessibility
  const {
    announce,
    focusElement,
    focusFirstEmergencyElement,
    announcementText,
    shortcuts,
    isHelpVisible,
    showHelp,
    hideHelp,
  } = useKeyboardNavigation({
    onEmergencyTrigger: () => {
      setEmergencyMode(true);
      activatePerformanceMode();
      onEmergencyDetected?.(true);
      announceEmergency("Modo de emergência ativado via teclado.");
    },
    onVoiceToggle: () => {
      if (isVoiceSupported) {
        toggleListening();
        announce(
          isVoiceActive 
            ? "Reconhecimento de voz desativado." 
            : "Reconhecimento de voz ativado.",
          "polite"
        );
      }
    },
    onClearChat: () => {
      setMessages([]);
      announce("Histórico do chat foi limpo.", "polite");
    },
    emergencyMode,
    disabled: isLoading,
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Initialize chat session
  const initializeSession = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      const response = await fetch("/api/ai/universal-chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          interface: interfaceType,
          clinicId,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat session");
      }

      const data = await response.json();

      const newSession: ChatSession = {
        id: data.sessionId,
        title: `Chat ${interfaceType} - ${new Date().toLocaleTimeString("pt-BR")}`,
        status: "active",
        interface: interfaceType,
        messages: [],
        createdAt: new Date(),
      };

      setSession(newSession);
      setConnectionStatus("connected");

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: interfaceType === "external"
          ? "Olá! Sou o assistente de IA da NeonPro. Como posso ajudá-lo hoje? Posso auxiliar com agendamentos, informações sobre <MedicalTerm term="tratamentos" context="medical" />, ou responder suas dúvidas médicas gerais."
          : "Olá! Assistente de IA interno da NeonPro. Posso ajudar com análises de pacientes, otimização de agenda, métricas da clínica e suporte operacional.",
        timestamp: new Date(),
        confidence: 1,
      };

      setMessages([welcomeMessage]);

      toast({
        title: "Chat conectado",
        description: "Sessão de chat iniciada com sucesso.",
      });
    } catch (_error) {
      // console.error("Failed to initialize session:", error);
      setConnectionStatus("disconnected");
      toast({
        title: "Erro de conexão",
        description: "Não foi possível iniciar o chat. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [interfaceType, clinicId, patientId, toast]);

  // Initialize session on mount
  useEffect(() => {
    if (!session) {
      initializeSession();
    }
  }, [session, initializeSession]);

  // Send message function
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
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setCurrentStreamingMessage("");

      try {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        // Performance monitoring for emergency scenarios
        const performanceStartTime = Date.now();

        const response = await fetch("/api/ai/universal-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp.toISOString(),
            })),
            interface: interfaceType,
            sessionId: session.id,
            userId,
            clinicId,
            patientId,
            emergencyContext: emergencyMode || isEmergencyModeActive,
            performanceMode: isEmergencyModeActive,
            targetLatency: isEmergencyModeActive ? 200 : 1000,
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

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
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
                      // Handle compliance warnings
                      if (
                        parsedData.complianceFlags
                        && parsedData.complianceFlags.length > 0
                      ) {
                        toast({
                          title: "Aviso de Conformidade",
                          description:
                            `${parsedData.complianceFlags.length} avisos de conformidade detectados: ${
                              parsedData.complianceFlags.join(
                                ", ",
                              )
                            }.`,
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
                      };

                      setMessages((prev) => [...prev, assistantMessage]);
                      setCurrentStreamingMessage("");

                      // Handle emergency detection
                      if (parsedData.emergencyDetected) {
                        onEmergencyDetected?.(true);
                        toast({
                          title: "⚠️ Situação de Emergência Detectada",
                          description:
                            "Esta conversa foi sinalizada para atenção imediata da equipe médica.",
                          variant: "destructive",
                        });
                      }

                      // Handle escalation
                      if (parsedData.escalationTriggered) {
                        onEscalationTriggered?.(true);
                        toast({
                          title: "📞 Escalação Ativada",
                          description: "Conectando com um profissional de saúde...",
                        });
                      }

                      // Show suggested actions
                      if (
                        parsedData.suggestedActions
                        && parsedData.suggestedActions.length > 0
                      ) {
                        toast({
                          title: "Ações Sugeridas",
                          description: parsedData.suggestedActions.join(", "),
                        });
                      }
                      break;
                    }

                    case "error": {
                      throw new Error(parsedData.error || "Erro desconhecido");
                    }
                  }
                } catch (_error) {
                  // console.error("Error parsing SSE data:", error);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          
          // Performance monitoring and metrics collection
          if (isEmergencyModeActive) {
            const performanceEndTime = Date.now();
            const actualLatency = performanceEndTime - performanceStartTime;
            
            // Validate emergency response time SLA (<200ms target)
            if (actualLatency > 200) {
              toast({
                title: "⚠️ Performance SLA Alert",
                description: `Resposta de emergência demorou ${actualLatency}ms (target: <200ms)`,
                variant: "destructive",
              });
            } else {
              toast({
                title: "⚡ Emergency Response Success",
                description: `Resposta otimizada: ${actualLatency}ms (SLA: ✅)`,
                variant: "default",
              });
            }
          }
        }
      } catch (error: unknown) {
        // console.error("Chat error:", error);

        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled
        }

        setCurrentStreamingMessage("");

        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
          timestamp: new Date(),
          confidence: 0,
        };

        setMessages((prev) => [...prev, errorMessage]);

        toast({
          title: "Erro no chat",
          description: error instanceof Error
            ? error.message
            : "Não foi possível enviar a mensagem.",
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
      interfaceType,
      userId,
      clinicId,
      patientId,
      onEmergencyDetected,
      onEscalationTriggered,
      toast,
    ],
  );

  // Handle input submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as React.FormEvent<Element>);
      }
    },
    [handleSubmit],
  );

  // Enhanced Voice Controls with Emergency Detection
  const handleVoiceToggle = useCallback(() => {
    if (!isVoiceSupported) {
      toast({
        title: "Comandos de Voz Não Suportados",
        description: "Seu navegador não suporta reconhecimento de voz ou síntese de fala.",
        variant: "destructive",
      });
      return;
    }

    if (recognition.isListening) {
      stopListening();
      toast({
        title: "🎤 Comandos de Voz Desativados",
        description: "Reconhecimento de voz desligado.",
      });
    } else {
      startListening();
      toast({
        title: "🎤 Comandos de Voz Ativados",
        description: interfaceType === "external" 
          ? "Diga 'emergência', 'socorro', ou 'ajuda' para ativar protocolo de emergência."
          : "Sistema de reconhecimento de voz ativo para profissionais.",
      });
    }
  }, [isVoiceSupported, recognition.isListening, startListening, stopListening, interfaceType, toast]);

  const handleSpeechToggle = useCallback(() => {
    if (!isVoiceSupported) {
      toast({
        title: "Síntese de Voz Não Suportada",
        description: "Seu navegador não suporta síntese de fala.",
        variant: "destructive",
      });
      return;
    }

    if (synthesis.isSpeaking) {
      stopSpeaking();
      toast({
        title: "🔇 Áudio Desativado",
        description: "Síntese de voz desligada.",
      });
    } else {
      const testMessage = interfaceType === "external"
        ? "Olá! Sistema de voz ativo. Em caso de emergência, diga 'emergência' ou 'socorro'."
        : "Sistema de voz profissional ativado. Comandos de voz disponíveis para operações internas.";
      
      speakText(testMessage);
      toast({
        title: "🔊 Áudio Ativado",
        description: "Sistema de síntese de voz ativo.",
      });
    }
  }, [isVoiceSupported, synthesis.isSpeaking, stopSpeaking, speakText, interfaceType, toast]);

  if (isMinimized && minimizable) {
    return (
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className={cn("fixed right-4 bottom-4 z-50", className)}
        initial={{ scale: 0.8, opacity: 0 }}
      >
        <Button
          className="h-16 w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90"
          onClick={() => setIsMinimized(false)}
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
          {messages.length > 1 && (
            <Badge className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full p-0">
              {messages.length - 1}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "mx-auto flex h-full max-h-[600px] w-full max-w-2xl flex-col",
        minimizable && "fixed right-4 bottom-4 z-50 h-[500px] w-96 shadow-xl",
        className,
      )}
      initial={{ scale: 0.95, opacity: 0 }}
    >
      {/* ARIA Live Region for Keyboard Navigation Announcements */}
      <div 
        id="keyboard-announcements" 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
        role="status"
      >
        {announcementText}
      </div>
      
      {/* Skip Links for Chat Navigation */}
      <nav className="sr-only" aria-label="Navegação rápida do chat">
        <a 
          href="#chat-messages" 
          className="skip-link focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:font-medium"
        >
          Pular para mensagens do chat
        </a>
        <a 
          href="#chat-input" 
          className="skip-link focus:not-sr-only focus:absolute focus:top-4 focus:left-36 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:font-medium"
        >
          Pular para entrada de mensagem
        </a>
        {emergencyMode && (
          <a 
            href="#emergency-actions" 
            className="skip-link focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:bg-destructive focus:text-white focus:px-4 focus:py-2 focus:rounded focus:font-bold"
          >
            Pular para ações de emergência
          </a>
        )}
      </nav>

      <Card 
        className="flex h-full flex-col border-2"
        role="region"
        aria-label="Chat de IA médica NeonPro"
      >
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500",
                )}
              />
              <CardTitle className="flex items-center gap-2">
                <Bot 
                  className="h-5 w-5 text-primary" 
                  aria-hidden="true"
                />
                <span id="chat-title">Chat AI NeonPro</span>
                <Badge
                  variant={interfaceType === "internal" ? "default" : "secondary"}
                  aria-label={interfaceType === "internal" 
                    ? "Interface interna para profissionais de saúde" 
                    : "Interface externa para pacientes"
                  }
                >
                  {interfaceType === "internal" ? "Interno" : <MedicalTerm term="paciente" context="medical" />}
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {session?.status === "active" && (
                <Badge className="text-xs" variant="outline">
                  <Shield 
                    className="mr-1 h-3 w-3" 
                    aria-label="Proteção LGPD ativa"
                  />
                  <MedicalTerm term="lgpd" context="compliance" />
                </Badge>
              )}
              {emergencyMode && (
                <Badge className="emergency-status-indicator animate-pulse text-xs" variant="destructive">
                  <AlertTriangle 
                    className="mr-1 h-3 w-3" 
                    aria-label="Ícone de emergência médica"
                  />
                  <MedicalTerm term="emergência" context="emergency" />
                </Badge>
              )}
              {recognition.isListening && (
                <Badge className="text-xs" variant="secondary">
                  <Mic 
                    className="mr-1 h-3 w-3" 
                    aria-label="Reconhecimento de voz ativo"
                  />
                  VOZ ATIVA
                </Badge>
              )}
              {isEmergencyModeActive && (
                <Badge className="animate-pulse text-xs" variant="default">
                  <Zap 
                    className="mr-1 h-3 w-3" 
                    aria-label="Modo de performance de emergência ativo"
                  />
                  PERFORMANCE {currentLatency}ms
                </Badge>
              )}
              {isOptimized && emergencyQueuePosition !== null && (
                <Badge className="text-xs" variant="outline">
                  <TrendingUp 
                    className="mr-1 h-3 w-3" 
                    aria-label="Posição na fila de emergência"
                  />
                  FILA #{emergencyQueuePosition}
                </Badge>
              )}
              {isOfflineReady && emergencyMode && (
                <Badge className="text-xs" variant="secondary">
                  <Gauge 
                    className="mr-1 h-3 w-3" 
                    aria-label="Modo offline disponível"
                  />
                  OFFLINE OK
                </Badge>
              )}
              <Button
                disabled={isLoading}
                onClick={handleVoiceToggle}
                size="sm"
                variant={recognition.isListening ? "default" : "ghost"}
                className={cn(
                  recognition.isListening && "bg-red-500 hover:bg-red-600 text-white",
                  emergencyMode && "animate-pulse focus-emergency"
                )}
                title={recognition.isListening 
                  ? "Desativar comandos de voz" 
                  : "Ativar comandos de voz para emergências"
                }
                aria-label={recognition.isListening 
                  ? "Desativar comandos de voz para emergências"
                  : "Ativar comandos de voz para detecção de emergências"
                }
              >
                {recognition.isListening ? (
                  <MicOff 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                ) : (
                  <Mic 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                )}
              </Button>
              <Button
                disabled={isLoading}
                onClick={handleSpeechToggle}
                size="sm"
                variant={synthesis.isSpeaking ? "default" : "ghost"}
                className="focus-enhanced"
                title={synthesis.isSpeaking 
                  ? "Desativar áudio" 
                  : "Ativar síntese de voz"
                }
                aria-label={synthesis.isSpeaking 
                  ? "Desativar síntese de voz"
                  : "Ativar síntese de voz para anúncios médicos"
                }
              >
                {synthesis.isSpeaking ? (
                  <VolumeX 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                ) : (
                  <Volume2 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                )}
              </Button>
              {emergencyMode && (
                <Button
                  onClick={() => {
                    onEscalationTriggered?.(true);
                    announceEmergency("Conectando com médico de plantão.");
                  }}
                  size="sm"
                  variant="destructive"
                  className="animate-pulse focus-emergency emergency-button"
                  title="Chamar médico imediatamente"
                  aria-label="EMERGÊNCIA: Chamar médico imediatamente"
                  role="button"
                  aria-describedby="emergency-action-warning"
                  tabIndex={0}
                  data-emergency="true"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onEscalationTriggered?.(true);
                      announceEmergency("Conectando com médico de plantão.");
                      announce("Emergência ativada via teclado. Conectando com médico.", "assertive");
                    }
                  }}
                >
                  <PhoneCall 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    Conectar com <MedicalTerm term="médico" context="emergency" /> de <MedicalTerm term="plantão" context="medical" /> imediatamente
                  </span>
                </Button>
              )}
              {minimizable && (
                <Button
                  onClick={() => setIsMinimized(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <ScrollArea 
            id="chat-messages"
            className="flex-1 px-4"
            role="log"
            aria-label="Histórico de mensagens do chat médico"
            aria-live="polite"
          >
            <div className="space-y-4 py-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} />
                ))}
                {currentStreamingMessage && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <p className="text-sm">{currentStreamingMessage}</p>
                        <Loader2 className="mt-1 inline h-3 w-3 animate-spin" />
                      </div>
                    </div>
                  </motion.div>
                )}
                {isLoading && !currentStreamingMessage && (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                    initial={{ opacity: 0 }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Emergency Performance Status Display */}
          {(emergencyMode || isEmergencyModeActive) && (
            <div 
              id="emergency-actions"
              className="flex-shrink-0 border-t bg-red-50 p-3"
              role="region"
              aria-label="Painel de ações de emergência médica"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Modo Emergência Ativo</span>
                </div>
                <div className="flex items-center gap-2 text-red-700">
                  <TrendingUp className="h-3 w-3" />
                  <span>{currentLatency}ms</span>
                  {emergencyQueuePosition !== null && (
                    <>
                      <Gauge className="h-3 w-3" />
                      <span>Fila #{emergencyQueuePosition}</span>
                    </>
                  )}
                  {isOfflineReady && (
                    <Badge variant="secondary" className="text-xs">
                      Offline Ready
                    </Badge>
                  )}
                </div>
              </div>
              {edgeNodeStatus && (
                <div className="mt-2 text-xs text-red-600">
                  Edge: {edgeNodeStatus.region} ({edgeNodeStatus.latency}ms)
                </div>
              )}
            </div>
          )}

          <div 
            id="chat-input" 
            className="flex-shrink-0 border-t p-4"
            role="region"
            aria-label="Área de entrada de mensagem"
          >
            <form 
              className="flex gap-2" 
              onSubmit={handleSubmit}
              aria-label="Enviar mensagem para o assistente médico de IA"
            >
              <Input
                id="chat-input"
                className="flex-1"
                disabled={isLoading || connectionStatus !== "connected"}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={interfaceType === "external"
                  ? "Digite sua mensagem..."
                  : "Digite sua consulta interna..."}
                ref={inputRef}
                value={inputValue}
                aria-label={interfaceType === "external"
                  ? "Digite sua mensagem para o assistente médico"
                  : "Digite sua consulta interna para análise médica"
                }
                aria-describedby="input-help"
                role="textbox"
                aria-multiline="false"
                tabIndex={1}
                data-medical="true"
              />
              <Button
                disabled={!inputValue.trim()
                  || isLoading
                  || connectionStatus !== "connected"}
                size="sm"
                type="submit"
                aria-label={isLoading
                  ? "Processando mensagem médica..."
                  : "Enviar mensagem para assistente médico"
                }
                className="focus-enhanced"
                tabIndex={2}
                data-medical="true"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!inputValue.trim() || isLoading) return;
                    handleSubmit(e as any);
                    announce("Mensagem enviada para análise médica.", "polite");
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 
                    className="h-4 w-4 animate-spin" 
                    aria-hidden="true"
                  />
                ) : (
                  <Send 
                    className="h-4 w-4" 
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">
                  {isLoading ? "Processando" : "Enviar"}
                </span>
              </Button>
            </form>

            {/* Input Help Text for Screen Readers */}
            <div id="input-help" className="sr-only">
              {interfaceType === "external"
                ? "Descreva seus sintomas, dúvidas sobre <MedicalTerm term=\"procedimentos\" context=\"medical\" /> estéticos ou agende <MedicalTerm term=\"consultas\" context=\"medical\" />. Para emergências, diga 'emergência' ou 'socorro'."
                : "Consulte dados de pacientes, métricas da clínica ou solicite análises médicas. Use termos específicos como 'paciente', 'agenda' ou 'relatório'."
              }
            </div>

            {/* Medical Terminology Context */}
            <div id="medical-context" className="sr-only">
              Assistente médico com conhecimento em: dermatologia estética, <MedicalTerm term="procedimentos" context="medical" /> com <MedicalTerm term="botox" context="procedure" />, <MedicalTerm term="preenchimentos" context="procedure" />, lasers, <MedicalTerm term="lgpd" context="compliance" />, <MedicalTerm term="anvisa" context="compliance" /> e <MedicalTerm term="cfm" context="compliance" /> compliance.
            </div>

            {/* Emergency Action Warning for Screen Readers */}
            <div id="emergency-action-warning" className="sr-only" aria-live="polite">
              Ação de <MedicalTerm term="emergência" context="emergency" /> médica crítica. Conectará imediatamente com <MedicalTerm term="médico" context="emergency" /> de <MedicalTerm term="plantão" context="medical" />.
            </div>
            </form>

            {/* Keyboard Shortcuts Help Dialog */}
            {isHelpVisible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 right-0 mx-2 bg-background border rounded-lg shadow-lg p-4 z-50"
                role="dialog"
                aria-label="Atalhos do teclado para navegação"
                aria-modal="false"
                tabIndex={-1}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold">Atalhos do Teclado</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideHelp}
                    aria-label="Fechar ajuda de atalhos"
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="text-xs space-y-2 max-h-32 overflow-y-auto">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {shortcut.modifiers.length > 0 && (
                          <span className="font-mono bg-muted px-1 rounded mr-1">
                            {shortcut.modifiers.join('+')}
                          </span>
                        )}
                        <span className="font-mono bg-muted px-1 rounded">
                          {shortcut.key}
                        </span>
                      </span>
                      <span className={`text-right flex-1 ml-2 ${
                        shortcut.priority === 'emergency' ? 'text-destructive font-medium' :
                        shortcut.priority === 'medical' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                  <p>Pressione <span className="font-mono bg-muted px-1 rounded">Escape</span> para fechar</p>
                  <p>🚨 Atalhos de <span className="text-destructive font-medium">emergência</span> têm prioridade máxima</p>
                </div>
              </motion.div>
            )}
            {connectionStatus === "disconnected" && (
              <p className="mt-2 text-muted-foreground text-xs">
                Reconectando... <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Individual message component
function ChatMessageComponent({ message }: { message: ChatMessage; }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 20 }}
      role="article"
      aria-label={`Mensagem de ${isUser ? "paciente" : "assistente médico"} às ${message.timestamp.toLocaleTimeString("pt-BR")}`}
    >
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
        aria-label={isUser ? "Avatar do paciente" : "Avatar do assistente médico"}
      >
        {isUser ? (
          <User 
            className="h-4 w-4" 
            aria-hidden="true"
          />
        ) : (
          <Bot 
            className="h-4 w-4 text-primary" 
            aria-hidden="true"
          />
        )}
      </div>

      <div className="max-w-[80%] flex-1">
        <div
          className={cn(
            "rounded-lg px-3 py-2",
            isUser ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-2 text-muted-foreground text-xs",
            isUser && "justify-end",
          )}
        >
          <span>
            {message.timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {message.confidence !== undefined && !isUser && (
            <Badge 
              className="text-xs" 
              variant="outline"
              aria-label={`Nível de confiança da resposta médica: ${Math.round(message.confidence * 100)} por cento`}
            >
              {Math.round(message.confidence * 100)}% confiança
            </Badge>
          )}

          {message.emergencyDetected && (
            <Badge 
              className="text-xs" 
              variant="destructive"
              aria-label="Situação de emergência médica detectada nesta mensagem"
            >
              <AlertTriangle 
                className="mr-1 h-3 w-3" 
                aria-hidden="true"
              />
              Emergência
            </Badge>
          )}

          {message.escalationTriggered && (
            <Badge 
              className="text-xs" 
              variant="secondary"
              aria-label="Mensagem escalada para atendimento médico humano"
            >
              <Clock 
                className="mr-1 h-3 w-3" 
                aria-hidden="true"
              />
              Escalado
            </Badge>
          )}

          {message.complianceFlags && message.complianceFlags.length > 0 && (
            <Badge 
              className="text-xs" 
              variant="outline"
              aria-label={`${message.complianceFlags.length} avisos de conformidade LGPD detectados`}
            >
              <Shield 
                className="mr-1 h-3 w-3" 
                aria-hidden="true"
              />
              {message.complianceFlags.length} flags
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default UniversalAIChat;
