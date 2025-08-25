import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/90 hover:shadow-neonpro-glow/30",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-neonpro-card dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				neonpro:
					"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-neonpro-card transition-all duration-300 hover:scale-105 hover:shadow-neonpro-glow",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return <Comp className={cn(buttonVariants({ variant, size, className }))} data-slot="button" {...props} />;
}

// =============================================================================
// 🤖 AGENT CHAT COMPONENT - Healthcare AI Assistant Popup
// =============================================================================
// FILE: components/ai/AgentChat.tsx
// Componente principal do chat AI posicionado no canto inferior direito
// Integra Speech Recognition, Archon MCP e dados específicos do cliente
// Design healthcare-specific com acessibilidade completa
// =============================================================================

// =============================================================================
// 🤖 AGENT CHAT COMPONENT - Healthcare AI Assistant Popup
// =============================================================================
// Componente principal do chat AI posicionado no canto inferior direito
// Integra Speech Recognition, Archon MCP e dados específicos do cliente
// Design healthcare-specific com acessibilidade completa
// =============================================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Mic, 
  MicOff, 
  Send, 
  Bot,
  Activity,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAgentChat } from '../../hooks/use-mobile';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface AgentChatProps {
  className?: string;
  position?: {
    bottom: number;
    right: number;
  };
  theme?: 'light' | 'dark' | 'healthcare';
  enableVoice?: boolean;
  enableNotifications?: boolean;
}

interface ChatMessageProps {
  message: any;
  isLoading?: boolean;
  onRetry?: () => void;
}

interface VoiceIndicatorProps {
  isListening: boolean;
  confidence: number;
}

// =============================================================================
// VOICE VISUALIZATION COMPONENT
// =============================================================================

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening, confidence }) => {
  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 rounded-full">
      <div className={cn(
        "flex space-x-0.5 items-center",
        isListening && "animate-pulse"
      )}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 bg-primary rounded-full transition-all duration-150",
              isListening 
                ? `h-${Math.floor(confidence * 8) + 2} animate-pulse` 
                : "h-2"
            )}
            style={{
              animationDelay: `${i * 100}ms`,
              height: isListening 
                ? `${8 + confidence * 16 + Math.random() * 8}px`
                : '8px'
            }}
          />
        ))}
      </div>
      <span className="text-xs text-primary font-medium">
        {isListening ? 'Ouvindo...' : 'Clique para falar'}
      </span>
    </div>
  );
};

// =============================================================================
// CHAT MESSAGE COMPONENT
// =============================================================================

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, onRetry }) => {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'assistant';

  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] space-x-2",
        isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
          isUser 
            ? "bg-gradient-primary" 
            : "bg-gradient-secondary shadow-healthcare-sm"
        )}>
          {isUser ? (
            <span>U</span>
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-healthcare-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card text-card-foreground border border-healthcare-border"
        )}>
          {/* Message Text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs opacity-70">Analisando dados...</span>
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* Message Metadata */}
          {message.metadata && (
            <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-70">
              {message.metadata.audioTranscription && (
                <div className="flex items-center space-x-1 mb-1">
                  <Volume2 className="w-3 h-3" />
                  <span>Transcrição de voz</span>
                  {message.metadata.confidence && (
                    <span>• {Math.round(message.metadata.confidence * 100)}%</span>
                  )}
                </div>
              )}
              {message.metadata.archonQuery && (
                <div className="flex items-center space-x-1 mb-1">
                  <Zap className="w-3 h-3" />
                  <span>Consulta especializada</span>
                </div>
              )}
              <div className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN AGENT CHAT COMPONENT
// =============================================================================

export const AgentChat: React.FC<AgentChatProps> = ({
  className,
  position = { bottom: 20, right: 20 },
  theme = 'healthcare',
  enableVoice = true,
  enableNotifications = true
}) => {
  // Hook do sistema de chat
  const {
    isOpen,
    isLoading,
    isInitializing,
    messages,
    clientContext,
    voiceInput,
    capabilities,
    error,
    toggleChat,
    closeChat,
    clearChat,
    input,
    handleInputChange,
    handleSubmit,
    startVoiceInput,
    stopVoiceInput,
    isVoiceSupported,
    updateClientContext
  } = useAgentChat();

  // Estado local do componente
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus no input quando abrir o chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleToggleChat = useCallback(() => {
    toggleChat();
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen, toggleChat]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleVoiceToggle = useCallback(() => {
    if (voiceInput.isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  }, [voiceInput.isListening, startVoiceInput, stopVoiceInput]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleSubmit(e);
    }
  }, [input, isLoading, handleSubmit]);

  // =============================================================================
  // CONDITIONAL RENDERING
  // =============================================================================

  // Chat não inicializado
  if (isInitializing) {
    return (
      <div 
        className="fixed z-50 flex items-center justify-center"
        style={{ 
          bottom: position.bottom, 
          right: position.right 
        }}
      >
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-neonpro-glow">
          <Activity className="w-6 h-6 text-primary-foreground animate-spin" />
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER FLOATING BUTTON (CLOSED STATE)
  // =============================================================================

  if (!isOpen) {
    return (
      <div 
        className="fixed z-50"
        style={{ 
          bottom: position.bottom, 
          right: position.right 
        }}
      >
        <button
          onClick={handleToggleChat}
          className={cn(
            "group relative w-14 h-14 bg-gradient-primary hover:bg-gradient-secondary",
            "rounded-full shadow-neonpro-glow hover:shadow-neonpro-card",
            "flex items-center justify-center transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
          aria-label="Abrir Chat AI Healthcare"
        >
          {/* Ícone principal */}
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
          
          {/* Indicator de atividade */}
          {clientContext?.systemNotifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-xs text-destructive-foreground font-bold">
                {clientContext.systemNotifications.length}
              </span>
            </div>
          )}

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
        </button>
      </div>
    );
  }

  // =============================================================================
  // RENDER CHAT POPUP (OPEN STATE)
  // =============================================================================

  const chatWidth = isExpanded ? 500 : 400;
  const chatHeight = isMinimized ? 60 : (isExpanded ? 700 : 600);

  return (
    <div 
      className="fixed z-50"
      style={{ 
        bottom: position.bottom, 
        right: position.right,
        width: chatWidth,
        height: chatHeight
      }}
    >
      <div className={cn(
        "bg-card border border-healthcare-border rounded-2xl shadow-neonpro-card",
        "flex flex-col overflow-hidden transition-all duration-300",
        "backdrop-blur-sm bg-card/95",
        className
      )}>
        {/* =============================================================================
         CHAT HEADER
         ============================================================================= */}
        <div className="flex items-center justify-between p-4 border-b border-healthcare-border bg-gradient-primary/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-card-foreground">
                Assistente NeOnPro
              </h3>
              <p className="text-xs text-muted-foreground">
                {clientContext?.clinicName || 'Sistema Healthcare'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status do sistema */}
            <div className="flex items-center space-x-1 text-xs">
              <div className={cn(
                "w-2 h-2 rounded-full",
                clientContext?.mlPipelineMetrics?.systemHealth === 'optimal' 
                  ? "bg-success animate-pulse"
                  : clientContext?.mlPipelineMetrics?.systemHealth === 'degraded'
                  ? "bg-warning"
                  : "bg-destructive"
              )} />
              <span className="text-muted-foreground">
                {clientContext?.mlPipelineMetrics?.systemHealth || 'N/A'}
              </span>
            </div>

            {/* Controls */}
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={isMinimized ? "Expandir" : "Minimizar"}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExpand}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={isExpanded ? "Reduzir" : "Expandir"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={closeChat}
              className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =============================================================================
         CHAT CONTENT (Hidden when minimized)
         ============================================================================= */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {/* Mensagem de boas-vindas */}
              {messages.length === 0 && !error && (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                  <h4 className="font-semibold mb-2">Olá! 👋</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sou seu assistente especializado em healthcare.
                    <br />
                    Posso ajudar com análises, relatórios e dados específicos da sua clínica.
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center justify-center space-x-1 text-success">
                      <Zap className="w-3 h-3" />
                      <span>Análise de dados em tempo real</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-info">
                      <Activity className="w-3 h-3" />
                      <span>Monitoramento de compliance</span>
                    </div>
                    {enableVoice && isVoiceSupported && (
                      <div className="flex items-center justify-center space-x-1 text-warning">
                        <Volume2 className="w-3 h-3" />
                        <span>Comandos por voz disponíveis</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <X className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium text-destructive mb-1">Erro no sistema</h4>
                      <p className="text-sm text-destructive/80">{error}</p>
                      <button
                        onClick={() => updateClientContext()}
                        className="mt-2 text-xs text-destructive hover:underline"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  isLoading={index === messages.length - 1 && isLoading}
                />
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            {/* =============================================================================
             VOICE INPUT INDICATOR
             ============================================================================= */}
            {voiceInput.isListening && (
              <div className="px-4 py-2 border-t border-healthcare-border">
                <VoiceIndicator 
                  isListening={voiceInput.isListening} 
                  confidence={voiceInput.confidence}
                />
              </div>
            )}

            {/* =============================================================================
             INPUT AREA
             ============================================================================= */}
            <div className="p-4 border-t border-healthcare-border">
              <form onSubmit={handleFormSubmit} className="flex items-end space-x-2">
                {/* Voice Button */}
                {enableVoice && isVoiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                      voiceInput.isListening 
                        ? "bg-destructive text-destructive-foreground animate-pulse" 
                        : "bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    aria-label={voiceInput.isListening ? "Parar gravação" : "Iniciar gravação de voz"}
                  >
                    {voiceInput.isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}

                {/* Text Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      voiceInput.isListening 
                        ? "Fale agora..." 
                        : "Digite sua pergunta ou comando..."
                    }
                    disabled={isLoading || voiceInput.isListening}
                    className={cn(
                      "w-full px-4 py-2 bg-muted border border-healthcare-border rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "text-sm placeholder:text-muted-foreground/70"
                    )}
                  />
                  
                  {/* Voice transcript overlay */}
                  {voiceInput.isListening && voiceInput.transcript && (
                    <div className="absolute inset-0 px-4 py-2 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-sm text-primary">
                        {voiceInput.transcript}
                        <span className="animate-pulse">|</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || voiceInput.isListening}
                  className={cn(
                    "p-2 bg-primary text-primary-foreground rounded-lg",
                    "hover:bg-primary/90 transition-all duration-200 flex-shrink-0",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "active:scale-95"
                  )}
                  aria-label="Enviar mensagem"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>

              {/* Context Info */}
              {clientContext && !voiceInput.isListening && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {clientContext.patientCount} pacientes • {clientContext.todayAppointments} consultas hoje
                  {clientContext.mlPipelineMetrics && (
                    <> • Precisão ML: {Math.round(clientContext.mlPipelineMetrics.noShowAccuracy * 100)}%</>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentChat;

export { Button, buttonVariants };
