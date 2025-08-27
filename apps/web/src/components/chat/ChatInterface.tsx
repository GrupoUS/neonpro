"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Minimize2,
  Shield,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  confidence?: number;
  emergencyDetected?: boolean;
  escalationTriggered?: boolean;
  complianceFlags?: string[];
  healthcareContext?: {
    specialty?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    procedureType?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  status: "active" | "archived";
  interface: "external" | "internal" | "emergency";
  messages: ChatMessage[];
  createdAt: Date;
  healthcareContext?: {
    patientId?: string;
    clinicId?: string;
    specialty?: string;
  };
}

export interface HealthcareContext {
  patientId?: string;
  clinicId?: string;
  staffId?: string;
  specialty?: 'dermatology' | 'aesthetics' | 'plastic-surgery' | 'general';
  emergency?: boolean;
}

interface ChatInterfaceProps {
  mode?: 'internal' | 'external' | 'emergency';
  userId: string;
  healthcareContext?: HealthcareContext;
  complianceMode?: 'lgpd-full' | 'lgpd-minimal' | 'emergency-override';
  onEmergencyDetected?: (emergency: boolean) => void;
  onEscalationTriggered?: (escalation: boolean) => void;
  className?: string;
  minimizable?: boolean;
  initialMinimized?: boolean;
  children?: React.ReactNode;
}

export function ChatInterface({
  mode = "external",
  userId,
  healthcareContext,
  complianceMode = "lgpd-full",
  onEmergencyDetected,
  onEscalationTriggered,
  className,
  minimizable = false,
  initialMinimized = false,
  children,
}: ChatInterfaceProps) {
  // State management
  const [session, setSession] = useState<ChatSession | null>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Initialize chat session with TweakCN NEONPRO branding
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

      // Add welcome message with Brazilian healthcare context
      const welcomeMessages: ChatMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: getWelcomeMessage(mode, healthcareContext?.specialty),
          timestamp: new Date(),
          confidence: 1,
        }
      ];

      // Add compliance notice for LGPD
      if (complianceMode === "lgpd-full") {
        welcomeMessages.push({
          id: `lgpd-notice-${Date.now()}`,
          role: "system",
          content: "🛡️ Esta conversa está protegida pela LGPD (Lei Geral de Proteção de Dados). Seus dados pessoais são tratados com máxima segurança e privacidade.",
          timestamp: new Date(),
          complianceFlags: ["lgpd-notice"],
        });
      }

      setMessages(welcomeMessages);

      toast({
        title: "💚 Chat NeonPro Conectado",
        description: "Sessão iniciada com segurança LGPD e criptografia end-to-end.",
      });
    } catch (error) {
      setConnectionStatus("disconnected");
      toast({
        title: "❌ Erro de Conexão",
        description: "Não foi possível iniciar o chat. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  }, [mode, userId, healthcareContext, complianceMode, toast]);

  // Initialize session on mount
  useEffect(() => {
    if (!session) {
      initializeSession();
    }
  }, [session, initializeSession]);

  // Get contextual welcome message
  const getWelcomeMessage = (chatMode: string, specialty?: string): string => {
    const specialtyText = specialty ? ` especializado em ${getSpecialtyName(specialty)}` : "";
    
    switch (chatMode) {
      case "internal":
        return `🏥 Olá! Sou o Assistente IA Interno da NeonPro${specialtyText}. Posso ajudar com:\n\n• 📊 Análises de pacientes e métricas da clínica\n• 📅 Otimização de agenda e recursos\n• 💼 Relatórios administrativos e compliance\n• 🔍 Pesquisas em prontuários e históricos\n• 🎯 Suporte operacional especializado\n\nComo posso auxiliá-lo hoje?`;
        
      case "emergency":
        return `🚨 ASSISTENTE DE EMERGÊNCIA NEONPRO ATIVO\n\n⚡ Modo de resposta prioritária ativo\n🏥 Conectado com protocolos de emergência\n📞 Escalação automática habilitada\n\nDescreva a situação de emergência para acionamento imediato da equipe médica.`;
        
      default: // external
        return `💚 Olá! Bem-vindo ao Chat NeonPro${specialtyText}!\n\nSou seu assistente inteligente para:\n\n• 📅 Agendamentos e reagendamentos\n• ℹ️ Informações sobre tratamentos e procedimentos\n• 💊 Orientações pré e pós-procedimento\n• 💳 Suporte com pagamentos e planos\n• 🔍 Esclarecimentos sobre sua saúde estética\n\nComo posso ajudá-lo hoje?`;
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

  // Minimized state rendering with TweakCN NEONPRO styling
  if (isMinimized && minimizable) {
    return (
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className={cn("fixed right-4 bottom-4 z-50", className)}
        initial={{ scale: 0.8, opacity: 0 }}
      >
        <Button
          className={cn(
            "h-16 w-16 rounded-full shadow-lg healthcare-hover-scale",
            "bg-gradient-to-br from-primary to-primary/80",
            "hover:from-primary/90 hover:to-primary/70",
            "border-2 border-primary/20",
            mode === 'emergency' && "bg-destructive hover:bg-destructive/90",
            mode === 'internal' && "bg-chart-2 hover:bg-chart-2/90"
          )}
          onClick={() => setIsMinimized(false)}
          size="lg"
        >
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
          {messages.length > 1 && (
            <Badge className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full p-0 bg-chart-5 text-white border-background border-2">
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
        "mx-auto flex h-full max-h-[600px] w-full max-w-2xl flex-col healthcare-transition",
        minimizable && "fixed right-4 bottom-4 z-50 h-[500px] w-96 shadow-2xl",
        className,
      )}
      initial={{ scale: 0.95, opacity: 0 }}
    >
      <Card className={cn(
        "flex h-full flex-col border-2 healthcare-transition",
        "bg-gradient-to-br from-card/95 to-card/98 backdrop-blur-sm",
        mode === 'emergency' && "border-destructive/50 bg-gradient-to-br from-destructive/5 to-destructive/10",
        mode === 'internal' && "border-chart-2/30 bg-gradient-to-br from-chart-2/5 to-chart-2/10",
        mode === 'external' && "border-primary/30"
      )}>
        {/* Header with TweakCN NEONPRO branding */}
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Connection Status Indicator */}
              <div className="relative">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full healthcare-transition",
                    connectionStatus === "connected"
                      ? "bg-chart-5 shadow-lg shadow-chart-5/30"
                      : connectionStatus === "connecting"
                      ? "bg-chart-4 animate-pulse"
                      : "bg-destructive",
                  )}
                />
                {connectionStatus === "connected" && (
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-chart-5 animate-ping" />
                )}
              </div>

              <CardTitle className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  mode === 'emergency' ? "bg-destructive/10" : mode === 'internal' ? "bg-chart-2/10" : "bg-primary/10"
                )}>
                  {mode === 'emergency' ? (
                    <Bot className="h-5 w-5 text-destructive" />
                  ) : mode === 'internal' ? (
                    <Users className="h-5 w-5 text-chart-2" />
                  ) : (
                    <Bot className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <span className="text-foreground font-semibold">Chat NeonPro</span>
                
                <Badge
                  variant={mode === "internal" ? "default" : mode === "emergency" ? "destructive" : "secondary"}
                  className={cn(
                    "text-xs font-medium healthcare-transition",
                    mode === "internal" && "bg-chart-2 text-white",
                    mode === "external" && "bg-primary/10 text-primary border-primary/20",
                    mode === "emergency" && "bg-destructive text-destructive-foreground"
                  )}
                >
                  {mode === "internal" ? "Interno" : mode === "emergency" ? "Emergência" : "Paciente"}
                </Badge>
              </CardTitle>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Connection Status */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title={connectionStatus === "connected" ? "Conectado" : "Desconectado"}
              >
                {connectionStatus === "connected" ? (
                  <Wifi className="h-4 w-4 text-chart-5" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
              </Button>

              {/* LGPD Compliance Badge */}
              {session?.status === "active" && complianceMode !== "emergency-override" && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20" variant="outline">
                  <Shield className="mr-1 h-3 w-3" />
                  LGPD
                </Badge>
              )}

              {/* Minimize Button */}
              {minimizable && (
                <Button
                  onClick={() => setIsMinimized(true)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              <AnimatePresence>
                {children}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ChatInterface;