/**
 * Universal AI Chat Interface Component - FASE 3 Enhanced
 * Dual Interface: External Client + Internal Staff
 * Healthcare-optimized with Portuguese NLP + AI-powered features
 * WCAG 2.1 AA+ compliance, LGPD/ANVISA compliant
 */

"use client";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

// Basic types for the chat interface
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceConfig {
  interface_type: "external" | "internal";
  placeholder?: string;
}

import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  FileUp,
  Lightbulb,
  Mic,
  MicOff,
  Paperclip,
  Send,
  Settings,
  Sparkles,
  User,
  Volume2,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Healthcare-specific AI features
interface HealthcareSuggestion {
  id: string;
  text: string;
  type: "appointment" | "symptom" | "treatment" | "general";
  confidence: number;
  medicalTerm?: string;
  translation?: string;
}

// Voice recording state
interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  transcript?: string;
  error?: string;
}

// File upload progress
interface FileUploadState {
  isUploading: boolean;
  progress: number;
  fileName?: string;
  error?: string;
}

interface ChatInterfaceProps {
  interface_type?: "external" | "internal";
  className?: string;
  placeholder?: string;
  maxHeight?: string;
  showHeader?: boolean;
  showTypingIndicator?: boolean;
  autoFocus?: boolean;
  // FASE 3 AI-powered features
  enableSmartSuggestions?: boolean;
  enableVoiceInput?: boolean;
  enableFileUpload?: boolean;
  enableHealthcareNLP?: boolean;
  enablePredictiveText?: boolean;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  // Accessibility enhancements
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  screenReaderAnnouncements?: boolean;
}

export function ChatInterface({
  interface_type = "external",
  className,
  placeholder,
  maxHeight = "600px",
  showHeader = true,
  showTypingIndicator = true,
  autoFocus = true,
  // FASE 3 AI-powered features
  enableSmartSuggestions = true,
  enableVoiceInput = true,
  enableFileUpload = true,
  enableHealthcareNLP = true,
  enablePredictiveText = true,
  maxFileSize = 10, // 10MB default
  allowedFileTypes = ["image/*", ".pdf", ".doc", ".docx"],
  // Accessibility enhancements
  ariaLabelledBy,
  ariaDescribedBy,
  screenReaderAnnouncements = true,
}: ChatInterfaceProps) {
  const {
    state,
    sendMessage,
    streamMessage,
    getCurrentSession,
    getSessionHistory,
    isConnected,
    hasActiveSession,
    switchInterface,
  } = useChat();

  // Core state
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FASE 3 AI-powered state
  const [smartSuggestions, setSmartSuggestions] = useState<
    HealthcareSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
  });
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
  });

  // Accessibility state
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [_focusedElementId, _setFocusedElementId] = useState<string>("");

  // Healthcare terminology dictionary for Portuguese NLP
  const healthcareTerms = useMemo(
    () => ({
      // Appointment terms
      agendar: { english: "schedule", context: "appointment" },
      consulta: { english: "consultation", context: "appointment" },
      retorno: { english: "follow-up", context: "appointment" },
      emergência: { english: "emergency", context: "urgent" },
      // Symptoms
      dor: { english: "pain", context: "symptom" },
      febre: { english: "fever", context: "symptom" },
      náusea: { english: "nausea", context: "symptom" },
      tontura: { english: "dizziness", context: "symptom" },
      // Treatments
      medicação: { english: "medication", context: "treatment" },
      exame: { english: "exam", context: "treatment" },
      cirurgia: { english: "surgery", context: "treatment" },
      fisioterapia: { english: "physiotherapy", context: "treatment" },
    }),
    [],
  );

  // FASE 3 AI-powered smart suggestions generator
  const generateSmartSuggestions = useCallback(
    (input: string): HealthcareSuggestion[] => {
      if (!enableSmartSuggestions || input.length < 2) {
        return [];
      }

      const suggestions: HealthcareSuggestion[] = [];
      const lowerInput = input.toLowerCase();

      // Healthcare-specific suggestions based on Portuguese medical terms
      Object.entries(healthcareTerms).forEach(([term, data]) => {
        if (term.includes(lowerInput) || lowerInput.includes(term)) {
          suggestions.push({
            id: `${term}-${Date.now()}`,
            text: `Gostaria de ${
              term === "agendar"
                ? "agendar uma consulta"
                : term === "dor"
                  ? "relatar sintomas de dor"
                  : term === "exame"
                    ? "solicitar informações sobre exames"
                    : `obter informações sobre ${term}`
            }?`,
            type: data.context as any,
            confidence: lowerInput === term ? 0.9 : 0.7,
            medicalTerm: term,
            translation: data.english,
          });
        }
      });

      // Common healthcare phrases
      if (lowerInput.includes("quando") || lowerInput.includes("horário")) {
        suggestions.push({
          id: "schedule-1",
          text: "Verificar horários disponíveis para consulta",
          type: "appointment",
          confidence: 0.8,
        });
      }

      if (lowerInput.includes("resultado") || lowerInput.includes("exame")) {
        suggestions.push({
          id: "results-1",
          text: "Consultar resultados de exames",
          type: "treatment",
          confidence: 0.8,
        });
      }

      return suggestions.slice(0, 3); // Limit to top 3 suggestions
    },
    [enableSmartSuggestions, healthcareTerms],
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-focus input with accessibility announcement
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (screenReaderAnnouncements) {
        announceToScreenReader(
          `Interface de chat ${
            interface_type === "external" ? "do paciente" : "da equipe médica"
          } carregada. Digite sua mensagem.`,
        );
      }
    }
  }, [
    autoFocus,
    interface_type,
    screenReaderAnnouncements,
    announceToScreenReader,
  ]);

  // Handle interface switch
  useEffect(() => {
    if (state.config.interface_type !== interface_type) {
      switchInterface(interface_type);
    }
  }, [interface_type, state.config.interface_type, switchInterface]);

  // Generate smart suggestions based on input
  useEffect(() => {
    const suggestions = generateSmartSuggestions(inputValue);
    setSmartSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && inputValue.length > 1);
  }, [inputValue, generateSmartSuggestions]);

  // Accessibility: Screen reader announcements
  const announceToScreenReader = useCallback(
    (message: string) => {
      if (!screenReaderAnnouncements) {
        return;
      }
      setAnnouncements((prev) => [...prev.slice(-4), message]); // Keep last 5 announcements
    },
    [screenReaderAnnouncements],
  );

  // FASE 3: Enhanced message sending with AI context
  const handleSendMessage = async () => {
    if (!inputValue.trim() || state.is_loading) {
      return;
    }

    const messageText = inputValue.trim();
    setInputValue("");
    setShowSuggestions(false);

    // Announce message being sent
    announceToScreenReader(`Enviando mensagem: ${messageText}`);

    try {
      if (state.config.streaming_enabled) {
        await streamMessage(messageText);
      } else {
        await sendMessage(messageText);
      }

      // Announce successful send
      announceToScreenReader("Mensagem enviada com sucesso");
    } catch {
      announceToScreenReader("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  // FASE 3: Enhanced keyboard navigation with smart suggestions
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle smart suggestion navigation
    if (showSuggestions && smartSuggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev < smartSuggestions.length - 1 ? prev + 1 : 0,
          );
          announceToScreenReader(
            `Sugestão ${selectedSuggestionIndex + 1}: ${
              smartSuggestions[selectedSuggestionIndex]?.text
            }`,
          );
          return;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : smartSuggestions.length - 1,
          );
          announceToScreenReader(
            `Sugestão ${selectedSuggestionIndex + 1}: ${
              smartSuggestions[selectedSuggestionIndex]?.text
            }`,
          );
          return;
        }
        case "Tab": {
          e.preventDefault();
          if (selectedSuggestionIndex >= 0) {
            const suggestion = smartSuggestions[selectedSuggestionIndex];
            setInputValue(suggestion.text);
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
            announceToScreenReader(`Sugestão selecionada: ${suggestion.text}`);
          }
          return;
        }
        case "Escape": {
          e.preventDefault();
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
          announceToScreenReader("Sugestões fechadas");
          return;
        }
      }
    }

    // Standard message sending
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && showSuggestions) {
        const suggestion = smartSuggestions[selectedSuggestionIndex];
        setInputValue(suggestion.text);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      } else {
        handleSendMessage();
      }
    }
  };

  // FASE 3: Voice recording with Portuguese healthcare optimization
  const toggleRecording = useCallback(async () => {
    if (!enableVoiceInput) {
      return;
    }

    if (voiceRecording.isRecording) {
      // Stop recording
      setVoiceRecording((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
      }));
      announceToScreenReader("Finalizando gravação");
    } else {
      // Start recording
      try {
        setVoiceRecording((prev) => ({
          ...prev,
          isRecording: true,
          error: undefined,
        }));
        announceToScreenReader("Iniciando gravação de voz");

        // Request microphone permission and start recording
        const _stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Here you would implement actual voice recording
        // For now, we'll simulate the recording state

        // Simulate processing after recording
        setTimeout(() => {
          setVoiceRecording((prev) => ({
            ...prev,
            isRecording: false,
            isProcessing: true,
          }));
          announceToScreenReader("Processando áudio...");

          // Simulate transcription
          setTimeout(() => {
            const mockTranscript = "Transcrição simulada da mensagem de voz";
            setVoiceRecording((prev) => ({
              ...prev,
              isProcessing: false,
              transcript: mockTranscript,
            }));
            setInputValue(mockTranscript);
            announceToScreenReader(`Transcrição concluída: ${mockTranscript}`);
          }, 2000);
        }, 3000);
      } catch {
        setVoiceRecording((prev) => ({
          ...prev,
          isRecording: false,
          error: "Erro ao acessar microfone",
        }));
        announceToScreenReader(
          "Erro ao iniciar gravação. Verifique as permissões do microfone.",
        );
      }
    }
  }, [enableVoiceInput, voiceRecording.isRecording, announceToScreenReader]);

  // FASE 3: File upload with healthcare document support
  const handleFileUpload = useCallback(() => {
    if (!(enableFileUpload && fileInputRef.current)) {
      return;
    }
    fileInputRef.current.click();
  }, [enableFileUpload]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        announceToScreenReader(
          `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`,
        );
        return;
      }

      // Start upload simulation
      setFileUpload({ isUploading: true, progress: 0, fileName: file.name });
      announceToScreenReader(`Enviando arquivo: ${file.name}`);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setFileUpload((prev) => {
          const newProgress = prev.progress + 10;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            announceToScreenReader(`Arquivo ${file.name} enviado com sucesso`);
            return { isUploading: false, progress: 100, fileName: file.name };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);

      // Reset file input
      event.target.value = "";
    },
    [maxFileSize, announceToScreenReader],
  );

  const getStatusColor = () => {
    switch (state.connection_status) {
      case "connected": {
        return "text-green-500";
      }
      case "connecting": {
        return "text-yellow-500";
      }
      case "disconnected": {
        return "text-gray-500";
      }
      case "error": {
        return "text-red-500";
      }
      default: {
        return "text-gray-500";
      }
    }
  };

  const getStatusText = () => {
    switch (state.connection_status) {
      case "connected": {
        return "Conectado";
      }
      case "connecting": {
        return "Conectando...";
      }
      case "disconnected": {
        return "Desconectado";
      }
      case "error": {
        return "Erro de conexão";
      }
      default: {
        return "Status desconhecido";
      }
    }
  };

  const messages = getCurrentSession()?.messages || [];

  return (
    <Card className={cn("flex flex-col", className)} style={{ maxHeight }}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">
                {interface_type === "external"
                  ? "Assistente Virtual NeonPro"
                  : "Assistente Interno"}
              </h3>
              <p className={cn("text-sm", getStatusColor())}>
                {getStatusText()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={interface_type === "external" ? "default" : "secondary"}
            >
              {interface_type === "external" ? "Paciente" : "Equipe"}
            </Badge>

            {state.is_streaming && (
              <Badge className="animate-pulse" variant="outline">
                <Sparkles className="mr-1 h-3 w-3" />
                Digitando...
              </Badge>
            )}

            {voiceRecording.isProcessing && (
              <Badge className="animate-pulse" variant="outline">
                <Volume2 className="mr-1 h-3 w-3" />
                Processando áudio...
              </Badge>
            )}

            {fileUpload.isUploading && (
              <Badge className="animate-pulse" variant="outline">
                <FileUp className="mr-1 h-3 w-3" />
                Enviando arquivo... {fileUpload.progress}%
              </Badge>
            )}

            <Button size="icon" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="mb-2 font-medium text-lg">
              {interface_type === "external"
                ? "Olá! Como posso ajudá-lo hoje?"
                : "Sistema pronto. Como posso auxiliar?"}
            </p>
            <p className="text-sm">
              {interface_type === "external"
                ? "Posso ajudar com agendamentos, informações sobre a clínica e orientações gerais."
                : "Consulte dados, gere relatórios ou faça perguntas sobre operações."}
            </p>
          </div>
        ) : (
          messages.map((message: ChatMessage) => (
            <MessageBubble
              interface_type={interface_type}
              key={message.id}
              message={message}
            />
          ))
        )}

        {state.is_loading && showTypingIndicator && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="border-red-200 border-t bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">Erro:</span>
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        {/* FASE 3: Smart Suggestions */}
        {showSuggestions && smartSuggestions.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lightbulb className="h-4 w-4" />
              <span>Sugestões inteligentes:</span>
            </div>
            <div className="space-y-1">
              {smartSuggestions.map((suggestion, index) => (
                <button
                  aria-label={`Sugestão ${index + 1}: ${suggestion.text}. Confiança: ${Math.round(
                    suggestion.confidence * 100,
                  )}%`}
                  className={cn(
                    "w-full rounded-md p-2 text-left text-sm transition-colors",
                    "hover:bg-muted focus:bg-muted focus:outline-none",
                    selectedSuggestionIndex === index &&
                      "border border-primary/20 bg-primary/10",
                  )}
                  key={suggestion.id}
                  onClick={() => {
                    setInputValue(suggestion.text);
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                    announceToScreenReader(
                      `Sugestão selecionada: ${suggestion.text}`,
                    );
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{suggestion.text}</span>
                    <div className="flex items-center gap-1">
                      {suggestion.medicalTerm && (
                        <Badge className="text-xs" variant="outline">
                          {suggestion.medicalTerm}
                        </Badge>
                      )}
                      <Badge
                        className={cn(
                          "text-xs",
                          suggestion.confidence > 0.8
                            ? "bg-green-100 text-green-700"
                            : suggestion.confidence > 0.6
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700",
                        )}
                        variant="secondary"
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              aria-describedby={
                showSuggestions ? "smart-suggestions" : undefined
              }
              aria-label={`Campo de mensagem do chat ${
                interface_type === "external"
                  ? "do paciente"
                  : "da equipe médica"
              }`}
              autoComplete="off"
              className={cn(
                "pr-32",
                voiceRecording.isRecording && "border-red-300 bg-red-50",
                fileUpload.isUploading && "border-blue-300 bg-blue-50",
              )}
              disabled={
                state.is_loading ||
                !isConnected() ||
                voiceRecording.isProcessing
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyPress}
              placeholder={
                voiceRecording.isProcessing
                  ? "Processando áudio..."
                  : fileUpload.isUploading
                    ? `Enviando ${fileUpload.fileName}...`
                    : placeholder ||
                      (interface_type === "external"
                        ? "Digite sua mensagem ou use os comandos de voz..."
                        : "Faça uma pergunta, solicite um relatório ou envie documentos...")
              }
              ref={inputRef}
              value={inputValue}
            />

            <div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
              {/* FASE 3: Enhanced File Upload */}
              {enableFileUpload && (
                <Button
                  aria-label="Enviar arquivo médico (PDF, imagens, documentos)"
                  className={cn(
                    "h-8 w-8",
                    fileUpload.isUploading &&
                      "animate-pulse bg-blue-50 text-blue-500",
                  )}
                  disabled={state.is_loading || fileUpload.isUploading}
                  onClick={handleFileUpload}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {fileUpload.isUploading ? (
                    <FileUp className="h-4 w-4 animate-bounce" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* FASE 3: Enhanced Voice Recording */}
              {enableVoiceInput && (
                <Button
                  aria-label={
                    voiceRecording.isRecording
                      ? "Parar gravação de voz"
                      : voiceRecording.isProcessing
                        ? "Processando áudio..."
                        : "Iniciar gravação de voz para ditado médico"
                  }
                  className={cn(
                    "h-8 w-8 transition-all duration-200",
                    voiceRecording.isRecording &&
                      "scale-110 animate-pulse bg-red-50 text-red-500",
                    voiceRecording.isProcessing &&
                      "animate-spin bg-blue-50 text-blue-500",
                  )}
                  disabled={state.is_loading || voiceRecording.isProcessing}
                  onClick={toggleRecording}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {voiceRecording.isProcessing ? (
                    <Volume2 className="h-4 w-4" />
                  ) : voiceRecording.isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              accept={allowedFileTypes.join(",")}
              aria-label="Selecionar arquivo para upload"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
              type="file"
            />
          </div>

          <Button
            disabled={!inputValue.trim() || state.is_loading || !isConnected()}
            onClick={handleSendMessage}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-3">
            <span>
              {interface_type === "external"
                ? "Suporte 24/7 • Atendimento seguro LGPD"
                : "Dados em tempo real • Acesso seguro"}
            </span>

            {/* FASE 3: Voice recording status */}
            {voiceRecording.isRecording && (
              <div className="flex animate-pulse items-center gap-1 text-red-600">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>Gravando...</span>
              </div>
            )}

            {/* FASE 3: File upload status */}
            {fileUpload.isUploading && (
              <div className="flex items-center gap-1 text-blue-600">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                <span>
                  {fileUpload.fileName} - {fileUpload.progress}%
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {enableSmartSuggestions && showSuggestions && (
              <span className="text-primary">
                ↑↓ navegar • Tab selecionar • Esc fechar
              </span>
            )}
            <span
              aria-label={`${inputValue.length} de 500 caracteres digitados`}
              aria-live="polite"
            >
              {inputValue.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* FASE 3: Screen Reader Announcements */}
      {screenReaderAnnouncements && announcements.length > 0 && (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="sr-only"
          role="status"
        >
          {announcements.at(-1)}
        </div>
      )}
    </Card>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  interface_type: ChatInterface;
}

function MessageBubble({ message, interface_type }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending": {
        return <Clock className="h-3 w-3 text-gray-400" />;
      }
      case "sent":
      case "delivered": {
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      }
      case "error": {
        return <XCircle className="h-3 w-3 text-red-500" />;
      }
      default: {
        return;
      }
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <Badge className="text-xs" variant="outline">
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-[80%] gap-3",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-full rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {message.streaming && (
            <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-current" />
          )}
        </div>

        <div
          className={cn(
            "mt-2 flex items-center justify-between text-xs opacity-70",
            isUser ? "flex-row-reverse" : "",
          )}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isUser && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="mr-auto flex max-w-[80%] gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="rounded-lg bg-muted px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"
                key={i}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
          <span className="ml-2 text-muted-foreground text-sm">
            Digitando...
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
