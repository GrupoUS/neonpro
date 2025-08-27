"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  AlertTriangle,
  Phone,
  Camera,
  Paperclip,
} from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  mode?: 'internal' | 'external' | 'emergency';
  maxLength?: number;
  showVoiceControls?: boolean;
  showFileUpload?: boolean;
  showEmergencyActions?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder,
  mode = "external",
  maxLength = 1000,
  showVoiceControls = true,
  showFileUpload = false,
  showEmergencyActions = false,
  className,
}: ChatInputProps) {
  // State management
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { toast } = useToast();

  // Get contextual placeholder
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    switch (mode) {
      case "internal":
        return "Digite sua consulta interna... (ex: 'Métricas de hoje', 'Pacientes agendados')";
      case "emergency":
        return "🚨 Descreva a situação de emergência...";
      default:
        return "Digite sua mensagem... (ex: 'Quero agendar', 'Dúvidas sobre procedimento')";
    }
  };

  // Handle input submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!inputValue.trim() || isLoading || disabled) {
        return;
      }

      if (inputValue.length > maxLength) {
        toast({
          title: "Mensagem muito longa",
          description: `Por favor, limite sua mensagem a ${maxLength} caracteres.`,
          variant: "destructive",
        });
        return;
      }

      onSendMessage(inputValue.trim());
      setInputValue("");
      setIsExpanded(false);
      inputRef.current?.focus();
    },
    [inputValue, isLoading, disabled, maxLength, onSendMessage, toast],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as React.FormEvent<Element>);
      } else if (e.key === "Escape") {
        setInputValue("");
        setIsExpanded(false);
      }
    },
    [handleSubmit],
  );

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsExpanded(value.length > 0 || mode === "emergency");
  }, [mode]);

  // Voice recognition (placeholder implementation)
  const toggleVoiceRecognition = useCallback(() => {
    setIsListening(!isListening);
    toast({
      title: "Recurso em desenvolvimento",
      description: "Reconhecimento de voz em português brasileiro será implementado em breve.",
    });
  }, [isListening, toast]);

  // Text-to-speech (placeholder implementation)
  const toggleTextToSpeech = useCallback(() => {
    setIsSpeaking(!isSpeaking);
    toast({
      title: "Recurso em desenvolvimento", 
      description: "Síntese de voz em português brasileiro será implementada em breve.",
    });
  }, [isSpeaking, toast]);

  // File upload handler
  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Upload em desenvolvimento",
        description: "Funcionalidade de upload de arquivos médicos será implementada em breve.",
      });
    }
  }, [toast]);

  // Emergency actions
  const handleEmergencyCall = useCallback(() => {
    toast({
      title: "🚨 Discagem de Emergência",
      description: "Conectando com SAMU (192) - Recurso em desenvolvimento",
      variant: "destructive",
    });
  }, [toast]);

  return (
    <div className={cn("flex-shrink-0 border-t p-4 space-y-3", className)}>
      {/* Emergency Actions Bar */}
      <AnimatePresence>
        {(showEmergencyActions || mode === "emergency") && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-2"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleEmergencyCall}
              size="sm"
              variant="destructive"
            >
              <Phone className="mr-2 h-4 w-4" />
              Ligar 192 (SAMU)
            </Button>
            <Button
              className="bg-chart-4 hover:bg-chart-4/90 text-white"
              onClick={() => toast({ title: "Recurso em desenvolvimento" })}
              size="sm"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className={cn(
          "flex gap-2 items-end healthcare-transition",
          isExpanded && "items-center"
        )}>
          {/* Voice Controls */}
          {showVoiceControls && (
            <div className="flex gap-1">
              <Button
                disabled={isLoading || disabled}
                onClick={toggleVoiceRecognition}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-10 w-10 p-0 healthcare-transition",
                  isListening && "bg-destructive/10 text-destructive"
                )}
                title={isListening ? "Parar gravação" : "Iniciar gravação de voz"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <Button
                disabled={isLoading || disabled}
                onClick={toggleTextToSpeech}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-10 w-10 p-0 healthcare-transition",
                  isSpeaking && "bg-primary/10 text-primary"
                )}
                title={isSpeaking ? "Parar síntese de voz" : "Ativar síntese de voz"}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* File Upload */}
          {showFileUpload && (
            <>
              <input
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              <Button
                disabled={isLoading || disabled}
                onClick={handleFileUpload}
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0"
                title="Anexar arquivo médico"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                disabled={isLoading || disabled}
                onClick={() => toast({ title: "Recurso em desenvolvimento" })}
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0"
                title="Capturar foto"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Input Field */}
          <div className="relative flex-1">
            <Input
              className={cn(
                "min-h-[40px] pr-4 resize-none healthcare-transition",
                "focus:ring-2 focus:ring-offset-2",
                mode === "emergency" ? "focus:ring-destructive border-destructive/30" :
                mode === "internal" ? "focus:ring-chart-2 border-chart-2/30" :
                "focus:ring-primary border-primary/30",
                inputValue.length > maxLength * 0.9 && "border-chart-4 focus:ring-chart-4"
              )}
              disabled={isLoading || disabled}
              maxLength={maxLength}
              onChange={handleInputChange}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              ref={inputRef}
              value={inputValue}
            />
            
            {/* Character Counter */}
            <AnimatePresence>
              {(isExpanded && inputValue.length > maxLength * 0.7) && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 right-0 text-xs text-muted-foreground"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: -10 }}
                >
                  <span className={cn(
                    inputValue.length > maxLength * 0.9 && "text-chart-4",
                    inputValue.length >= maxLength && "text-destructive font-medium"
                  )}>
                    {inputValue.length}/{maxLength}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send Button */}
          <Button
            disabled={!inputValue.trim() || isLoading || disabled || inputValue.length > maxLength}
            size="sm"
            type="submit"
            className={cn(
              "h-10 px-4 healthcare-transition shadow-sm healthcare-hover-scale",
              mode === "emergency" ? "bg-destructive hover:bg-destructive/90" :
              mode === "internal" ? "bg-chart-2 hover:bg-chart-2/90" :
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <AnimatePresence>
          {isExpanded && (
            <motion.p
              animate={{ opacity: 1, height: "auto" }}
              className="text-muted-foreground text-xs text-center"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
            >
              {mode === "emergency" 
                ? "🚨 Modo emergência: resposta prioritária ativada" 
                : mode === "internal"
                ? "💼 Chat interno: informações confidenciais protegidas por LGPD"
                : "💚 Pressione Enter para enviar • Escape para limpar"
              }
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {/* Connection Status Footer */}
      {disabled && (
        <motion.div
          animate={{ opacity: 1 }}
          className="text-center"
          initial={{ opacity: 0 }}
        >
          <p className="text-muted-foreground text-xs">
            Reconectando... <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default ChatInput;