/**
 * DataAgentChat Component (T038)
 * Conversational AI interface for NeonPro healthcare platform data queries
 *
 * Integrates with:
 * - CopilotKit for chat UI framework
 * - AG-UI Protocol for real-time agent communication  
 * - ottomator-agents backend logic
 * - Newly created API endpoints: /api/ai/data-agent, /api/ai/sessions, /api/ai/feedback
 * 
 * Features:
 * - Natural language queries for client data, appointments, financial information
 * - Portuguese language support for Brazilian healthcare market
 * - LGPD compliance with data privacy controls
 * - Real-time streaming responses via AG-UI Protocol
 * - Interactive action buttons for common workflows
 * - Session management with conversation history
 * - User feedback collection for continuous improvement
 */

'use client';

import { useCopilotContext, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotChat, CopilotPopup } from '@copilotkit/react-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Brain,
  Calendar,
  ChevronDown,
  DollarSign,
  Download,
  ExternalLink,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ThumbsDown,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActionHandlers } from './ActionHandlers';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Textarea,
  Toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';
import { createAGUIProtocolClient, useAGUIProtocol, AGUIConnectionState } from '@/services/agui-protocol';
import { useState } from 'react';

// Import our specific types for AI agent integration
import type {
  AgentAction,
  AgentResponse,
  ChatMessage,
  ChatState,
  DataAgentRequest,
  DataAgentResponse,
  AppointmentData,
  ClientData,
  FinancialData,
  UserQuery,
} from '@neonpro/types';

export interface DataAgentChatProps {
  /** Current user context for role-based access */
  userContext: {
    userId: string;
    userRole: 'admin' | 'professional' | 'assistant' | 'receptionist';
    domain?: string; // Clinic/domain identifier
  };
  /** Initial session ID to resume conversation */
  initialSessionId?: string;
  /** Show as popup vs inline chat */
  mode?: 'inline' | 'popup';
  /** Maximum height for inline mode */
  maxHeight?: string;
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** LGPD consent settings */
  lgpdConsent?: {
    canStoreHistory: boolean;
    dataRetentionDays: number;
  };
  /** Custom placeholder text */
  placeholder?: string;
  /** Test ID for testing */
  testId?: string;
  /** Callback when session changes */
  onSessionChange?: (sessionId: string | null) => void;
  /** Callback when new data is discovered */
  onDataDiscovered?: (data: {
    clients?: ClientData[];
    appointments?: AppointmentData[];
    financial?: FinancialData[];
  }) => void;
}

interface SessionResponse {
  success: boolean;
  session: {
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
  chatState?: ChatState;
  messageCount?: number;
}

interface CreateSessionRequest {
  title?: string;
  domain?: string;
  metadata?: Record<string, any>;
}

interface FeedbackRequest {
  rating: number;
  comment?: string;
  category?: 'accuracy' | 'helpfulness' | 'speed' | 'completeness' | 'clarity' | 'general';
  tags?: string[];
  metadata?: Record<string, any>;
}

interface QuickFeedbackRequest {
  messageId?: string;
  responseId?: string;
  helpful: boolean;
  issues?: string[];
  suggestions?: string;
}

// API Functions
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/ai${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json();
};

const sendDataAgentQuery = async (request: DataAgentRequest): Promise<DataAgentResponse> => {
  return apiCall('/data-agent', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

const createSession = async (request: CreateSessionRequest): Promise<SessionResponse> => {
  return apiCall('/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

const getSession = async (sessionId: string): Promise<SessionResponse> => {
  return apiCall(`/sessions/${sessionId}`);
};

const submitFeedback = async (sessionId: string, feedback: FeedbackRequest): Promise<any> => {
  return apiCall(`/sessions/${sessionId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
};

const submitQuickFeedback = async (sessionId: string, feedback: QuickFeedbackRequest): Promise<any> => {
  return apiCall(`/sessions/${sessionId}/feedback/quick`, {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
};

/**
 * Interactive Action Button Component
 * Renders clickable action buttons returned by the AI agent
 */
const ActionButton: React.FC<{
  action: AgentAction;
  onExecute: (action: AgentAction) => void;
}> = ({ action, onExecute }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'user': return <User className="h-3 w-3" />;
      case 'calendar': return <Calendar className="h-3 w-3" />;
      case 'chart-bar': return <DollarSign className="h-3 w-3" />;
      case 'download': return <Download className="h-3 w-3" />;
      case 'refresh': return <RefreshCw className="h-3 w-3" />;
      case 'plus': return <Plus className="h-3 w-3" />;
      case 'help': return <MessageSquare className="h-3 w-3" />;
      default: return <ExternalLink className="h-3 w-3" />;
    }
  };

  return (
    <Button
      variant={action.primary ? 'default' : 'outline'}
      size="sm"
      onClick={() => onExecute(action)}
      className="flex items-center gap-2 text-xs"
    >
      {action.icon && getIcon(action.icon)}
      {action.label}
    </Button>
  );
};

/**
 * Message Feedback Component
 * Allows users to provide feedback on assistant responses
 */
const MessageFeedback: React.FC<{
  messageId: string;
  sessionId: string;
  onFeedbackSubmitted: () => void;
}> = ({ messageId, sessionId, onFeedbackSubmitted }) => {
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitQuickFeedbackMutation = useMutation({
    mutationFn: (helpful: boolean) => submitQuickFeedback(sessionId, {
      messageId,
      helpful,
    }),
    onSuccess: () => {
      onFeedbackSubmitted();
    },
  });

  const submitDetailedFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackRequest) => submitFeedback(sessionId, data),
    onSuccess: () => {
      setShowDetailedFeedback(false);
      setRating(0);
      setComment('');
      onFeedbackSubmitted();
    },
  });

  const handleQuickFeedback = (helpful: boolean) => {
    submitQuickFeedbackMutation.mutate(helpful);
  };

  const handleDetailedFeedback = () => {
    if (rating === 0) return;
    
    submitDetailedFeedbackMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
      category: 'general',
      metadata: { messageId },
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFeedback(true)}
                disabled={submitQuickFeedbackMutation.isPending}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFeedback(false)}
                disabled={submitQuickFeedbackMutation.isPending}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta não útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={showDetailedFeedback} onOpenChange={setShowDetailedFeedback}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
            Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Resposta</DialogTitle>
            <DialogDescription>
              Sua avaliação nos ajuda a melhorar o atendimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nota (1-5 estrelas)</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(star)}
                    className={cn(
                      "h-8 w-8 p-0",
                      rating >= star ? "text-yellow-500" : "text-muted-foreground"
                    )}
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Comentário (opcional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Como podemos melhorar?"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDetailedFeedback}
                disabled={rating === 0 || submitDetailedFeedbackMutation.isPending}
                className="flex-1"
              >
                Enviar Avaliação
              </Button>
              <Button variant="outline" onClick={() => setShowDetailedFeedback(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Data Summary Card Component
 * Displays structured data results in a card format
 */
const DataSummaryCard: React.FC<{
  title: string;
  data: any[];
  type: 'clients' | 'appointments' | 'financial';
  summary?: any;
}> = ({ title, data, type, summary }) => {
  const [expanded, setExpanded] = useState(false);
  const displayLimit = 3;

  const renderItem = (item: any, index: number) => {
    switch (type) {
      case 'clients':
        return (
          <div key={index} className="p-2 border rounded-md">
            <div className="font-medium text-sm">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {item.email} • {item.status}
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div key={index} className="p-2 border rounded-md">
            <div className="font-medium text-sm">{item.clientName}</div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(item.scheduledAt)} • {item.serviceName}
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {item.status}
            </Badge>
          </div>
        );
      
      case 'financial':
        return (
          <div key={index} className="p-2 border rounded-md">
            <div className="font-medium text-sm">{item.clientName}</div>
            <div className="text-xs text-muted-foreground">
              {item.serviceName} • {formatCurrency(item.amount)}
            </div>
            <Badge variant={item.status === 'paid' ? 'default' : 'destructive'} className="text-xs mt-1">
              {item.status}
            </Badge>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <Card className="mt-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length} {data.length === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
        {summary && (
          <CardDescription className="text-xs">
            {type === 'financial' && (
              <span>Total: {formatCurrency(summary.total)}</span>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {data.slice(0, expanded ? data.length : displayLimit).map((item, index) => renderItem(item, index))}
          
          {data.length > displayLimit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-center text-xs"
            >
              {expanded ? 'Ver menos' : `Ver mais ${data.length - displayLimit} itens`}
              <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", expanded && "rotate-180")} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main DataAgentChat Component
 */
export const DataAgentChat: React.FC<DataAgentChatProps> = ({
  userContext,
  initialSessionId,
  mode = 'inline',
  maxHeight = '600px',
  mobileOptimized = true,
  lgpdConsent = {
    canStoreHistory: true,
    dataRetentionDays: 30,
  },
  placeholder = 'Digite sua consulta... Ex: "Quais os próximos agendamentos?"',
  testId = 'data-agent-chat',
  onSessionChange,
  onDataDiscovered,
}) => {
  // State management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Query client for cache management
  const queryClient = useQueryClient();

  // AG-UI Protocol integration
  const aguiConfig = {
    websocketUrl: process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/api/agents/ag-ui-rag-agent` 
      : `ws://${window.location.host}/api/agents/ag-ui-rag-agent`,
    httpUrl: process.env.NODE_ENV === 'production'
      ? `https://${window.location.host}/api/agents/ag-ui-rag-agent`
      : `http://${window.location.host}/api/agents/ag-ui-rag-agent`,
    userId: userContext.userId,
    authToken: localStorage.getItem('authToken') || undefined,
    enableEncryption: true,
    heartbeatInterval: 30000,
    reconnectAttempts: 5,
    reconnectDelay: 5000,
    timeout: 30000,
  };

  const { client: aguiClient, state: aguiState, session: aguiSession } = useAGUIProtocol(aguiConfig);

  // Connect to AG-UI Protocol when component mounts
  useEffect(() => {
    aguiClient.connect();
    
    // Handle AG-UI Protocol events
    const handleMessage = (message: any) => {
      const assistantMessage: ChatMessage = {
        id: message.id,
        role: 'assistant',
        content: message.content,
        timestamp: new Date().toISOString(),
        actions: message.actions || [],
        metadata: message.metadata || {},
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    };

    const handleError = (error: any) => {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Erro na conexão com o assistente. Verifique sua conexão e tente novamente.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    };

    const handleAuthenticated = (session: any) => {
      console.log('AG-UI Protocol authenticated:', session);
    };

    aguiClient.on('message', handleMessage);
    aguiClient.on('error', handleError);
    aguiClient.on('authenticated', handleAuthenticated);

    return () => {
      aguiClient.disconnect();
      aguiClient.removeAllListeners();
    };
  }, [aguiClient, userContext.userId]);

  // Update session context when needed
  const updateAGUISessionContext = useCallback((context: any) => {
    if (aguiSession && aguiClient.isConnected()) {
      aguiClient.updateSessionContext(context).catch(console.error);
    }
  }, [aguiSession, aguiClient]);

  // Load existing session if provided
  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session', currentSessionId],
    queryFn: () => getSession(currentSessionId!),
    enabled: !!currentSessionId,
    onSuccess: (data) => {
      if (data.success && data.chatState?.messages) {
        setMessages(data.chatState.messages);
      }
    },
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      if (data.success) {
        setCurrentSessionId(data.session.id);
        onSessionChange?.(data.session.id);
        queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendDataAgentQuery,
    onSuccess: (response) => {
      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          id: response.response.id,
          role: 'assistant',
          content: response.response.message,
          timestamp: new Date().toISOString(),
          data: response.response.data,
          actions: response.response.actions,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Notify parent of discovered data
        if (response.response.data) {
          onDataDiscovered?.(response.response.data);
        }

        // Show suggestions if available
        if (response.response.suggestions?.length) {
          // Could show suggestions in a separate component
        }
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    },
  });

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue.trim();

    // Create session if none exists
    if (!currentSessionId) {
      await createSessionMutation.mutateAsync({
        title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
        domain: userContext.domain,
        metadata: {
          userRole: userContext.userRole,
          initialQuery: query,
        },
      });
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Try to send via AG-UI Protocol first, fallback to HTTP API
    try {
      if (aguiClient.isConnected()) {
        await aguiClient.sendMessage(query, 'text', {
          sessionId: currentSessionId,
          userRole: userContext.userRole,
          domain: userContext.domain,
        });
        
        // Update session context with user role
        updateAGUISessionContext({
          userRole: userContext.userRole,
          domain: userContext.domain,
          lastQuery: query,
        });
      } else {
        // Fallback to HTTP API
        sendMessageMutation.mutate({
          query,
          sessionId: currentSessionId || undefined,
          userContext,
        });
      }
    } catch (error) {
      console.error('Error sending message via AG-UI Protocol, falling back to HTTP:', error);
      // Fallback to HTTP API
      sendMessageMutation.mutate({
        query,
        sessionId: currentSessionId || undefined,
        userContext,
      });
    }
  }, [inputValue, isLoading, currentSessionId, userContext, aguiClient, createSessionMutation, sendMessageMutation, updateAGUISessionContext]);

  // Handle action execution
  const handleActionExecute = useCallback((action: AgentAction) => {
    switch (action.type) {
      case 'view_details':
        if (action.payload?.clientId) {
          // Navigate to client details
          window.open(`/clientes/${action.payload.clientId}`, '_blank');
        }
        break;
      
      case 'create_appointment':
        // Navigate to appointment creation
        window.open('/agendamentos/novo', '_blank');
        break;
      
      case 'export_data':
        // Trigger data export
        console.log('Export data action:', action.payload);
        break;
      
      case 'navigate':
        if (action.payload?.path) {
          window.open(action.payload.path, '_blank');
        }
        break;
      
      case 'refresh':
        // Re-run the last query
        if (messages.length > 0) {
          const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
          if (lastUserMessage) {
            setInputValue(lastUserMessage.content);
            handleSendMessage();
          }
        }
        break;
      
      default:
        console.log('Unknown action type:', action.type);
    }
  }, [messages, handleSendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // CopilotKit integration for enhanced chat features
  const copilotContext = useCopilotContext();

  // Make current data available to CopilotKit
  useCopilotReadable({
    description: 'Current user context and session data',
    value: {
      userContext,
      currentSessionId,
      messagesCount: messages.length,
      lastActivity: messages[messages.length - 1]?.timestamp,
    },
  });

  // Render chat interface
  const chatInterface = (
    <Card className={cn(
      'flex flex-col w-full',
      mode === 'inline' ? 'h-full' : 'w-96 h-[500px]',
      mobileOptimized && 'touch-manipulation',
      'border-0 shadow-lg rounded-xl overflow-hidden'
    )} data-testid={testId}>
      {/* Header */}
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Consulta de Dados
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {userContext.userRole}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    onSessionChange?.(null);
                  }}
                  className="text-destructive"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nova Conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" style={{ maxHeight: mode === 'inline' ? maxHeight : undefined }}>
          <div className="space-y-4 py-4">
            {/* Welcome message */}
            {messages.length === 0 && !isLoadingSession && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Como posso ajudar você hoje?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça consultas sobre clientes, agendamentos ou informações financeiras
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Buscar Clientes
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Agendamentos
                  </Badge>
                  <Badge variant="outline">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Financeiro
                  </Badge>
                </div>
              </div>
            )}

            {/* Render messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                <div className={cn(
                  'max-w-[80%] rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Render structured data */}
                  {message.data && (
                    <div className="mt-3 space-y-2">
                      {message.data.clients && (
                        <DataSummaryCard
                          title="Clientes Encontrados"
                          data={message.data.clients}
                          type="clients"
                          summary={message.data.summary}
                        />
                      )}
                      {message.data.appointments && (
                        <DataSummaryCard
                          title="Agendamentos"
                          data={message.data.appointments}
                          type="appointments"
                          summary={message.data.summary}
                        />
                      )}
                      {message.data.financial && (
                        <DataSummaryCard
                          title="Dados Financeiros"
                          data={message.data.financial}
                          type="financial"
                          summary={message.data.summary}
                        />
                      )}
                    </div>
                  )}

                  {/* Render action buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <ActionHandlers
                      actions={message.actions}
                      onActionExecuted={handleActionExecute}
                      sessionId={currentSessionId || undefined}
                    />
                  )}

                  {/* Message metadata */}
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{formatDateTime(message.timestamp)}</span>
                    {message.role === 'assistant' && currentSessionId && (
                      <MessageFeedback
                        messageId={message.id}
                        sessionId={currentSessionId}
                        onFeedbackSubmitted={() => {
                          // Could show a toast or update UI
                        }}
                      />
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}

            {/* Loading state */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Analisando consulta...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="min-h-[44px] max-h-32 resize-none pr-12"
                rows={1}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* LGPD Notice */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {lgpdConsent.canStoreHistory
              ? `Conversa armazenada conforme LGPD por ${lgpdConsent.dataRetentionDays} dias`
              : 'Conversa não armazenada • Conforme LGPD'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Return popup or inline version
  if (mode === 'popup') {
    return (
      <CopilotPopup
        instructions="You are a healthcare data assistant for NeonPro. Help users query client data, appointments, and financial information in Portuguese."
        defaultOpen={false}
        clickOutsideToClose={true}
      >
        {chatInterface}
      </CopilotPopup>
    );
  }

  return (
    <div className="w-full h-full">
      {chatInterface}
    </div>
  );
};

export default DataAgentChat;