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
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { toast } = useToast();

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
          ? "Olá! Sou o assistente de IA da NeonPro. Como posso ajudá-lo hoje? Posso auxiliar com agendamentos, informações sobre tratamentos, ou responder suas dúvidas médicas gerais."
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
            emergencyContext: false,
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

  // Voice recognition (placeholder for future implementation)
  const toggleVoiceRecognition = useCallback(() => {
    setIsListening(!isListening);
    toast({
      title: "Recurso em desenvolvimento",
      description: "Reconhecimento de voz será implementado em breve.",
    });
  }, [isListening, toast]);

  // Text-to-speech (placeholder for future implementation)
  const toggleTextToSpeech = useCallback(() => {
    setIsSpeaking(!isSpeaking);
    toast({
      title: "Recurso em desenvolvimento",
      description: "Síntese de voz será implementada em breve.",
    });
  }, [isSpeaking, toast]);

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
      <Card className="flex h-full flex-col border-2">
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
                <Bot className="h-5 w-5 text-primary" />
                Chat AI NeonPro
                <Badge
                  variant={interfaceType === "internal" ? "default" : "secondary"}
                >
                  {interfaceType === "internal" ? "Interno" : "Paciente"}
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {session?.status === "active" && (
                <Badge className="text-xs" variant="outline">
                  <Shield className="mr-1 h-3 w-3" />
                  LGPD
                </Badge>
              )}
              <Button
                disabled={isLoading}
                onClick={toggleVoiceRecognition}
                size="sm"
                variant="ghost"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                disabled={isLoading}
                onClick={toggleTextToSpeech}
                size="sm"
                variant="ghost"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
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
          <ScrollArea className="flex-1 px-4">
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

          <div className="flex-shrink-0 border-t p-4">
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <Input
                className="flex-1"
                disabled={isLoading || connectionStatus !== "connected"}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={interfaceType === "external"
                  ? "Digite sua mensagem..."
                  : "Digite sua consulta interna..."}
                ref={inputRef}
                value={inputValue}
              />
              <Button
                disabled={!inputValue.trim()
                  || isLoading
                  || connectionStatus !== "connected"}
                size="sm"
                type="submit"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </Button>
            </form>
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
    >
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
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
            <Badge className="text-xs" variant="outline">
              {Math.round(message.confidence * 100)}% confiança
            </Badge>
          )}

          {message.emergencyDetected && (
            <Badge className="text-xs" variant="destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Emergência
            </Badge>
          )}

          {message.escalationTriggered && (
            <Badge className="text-xs" variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Escalado
            </Badge>
          )}

          {message.complianceFlags && message.complianceFlags.length > 0 && (
            <Badge className="text-xs" variant="outline">
              <Shield className="mr-1 h-3 w-3" />
              {message.complianceFlags.length} flags
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default UniversalAIChat;
