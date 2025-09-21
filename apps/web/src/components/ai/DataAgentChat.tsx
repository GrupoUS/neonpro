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
import { CopilotPopup } from '@copilotkit/react-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Brain,
  Calendar,
  ChevronDown,
  DollarSign,
  Download,
  ExternalLink,
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionHandlers } from './ActionHandlers';

import { useAGUIProtocol } from '@/services/agui-protocol';
import { formatCurrency, formatDateTime } from '@/utils/brazilian-formatters';
import {
  Avatar,
  AvatarFallback,
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
  ScrollArea,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@neonpro/ui';
import { cn } from '@neonpro/ui';

// Import NeonPro neumorphic design system
import {
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicTextarea,
  MedicalAlertCard,
  ClinicalActionPanel,
  PatientStatusBadge,
  neonProColors,
} from '@/components/ui/neonpro-neumorphic';

// Import enhanced accessibility and performance monitoring
import { AccessibilityValidator, useHealthcareAccessibility } from './DataAgentChatAccessibilityEnhanced';
import { HealthcareWorkflowMonitor, useHealthcareWorkflowTracking } from './HealthcareWorkflowMonitor';

// Import our specific types for AI agent integration
import type {
  AgentAction,
  AgentResponse,
  AppointmentData,
  ChatMessage,
  ChatState,
  ClientData,
  DataAgentRequest,
  DataAgentResponse,
  FinancialData,
  UserQuery,
} from '@neonpro/types';

// Security Status Component
const SecurityStatusIndicator: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'secure' | 'checking' | 'error'>('checking');
  
  useEffect(() => {
    // Check HTTPS connection and security status
    const checkSecurity = () => {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      setConnectionStatus(isSecure ? 'secure' : 'error');
    };
    
    checkSecurity();
    
    // Monitor connection status
    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex items-center gap-2 text-xs' role="status" aria-live="polite">
      <div className={cn(
        'w-2 h-2 rounded-full',
        connectionStatus === 'secure' ? 'bg-green-500 animate-pulse' : 
        connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
      )} />
      <span className='text-[#B4AC9C]'>
        {connectionStatus === 'secure' ? 'Conexão Segura (HTTPS)' :
         connectionStatus === 'error' ? 'Conexão Insegura' : 'Verificando...'}
      </span>
      {connectionStatus === 'secure' && (
        <span className='text-[#AC9469] font-medium'>🔒 Criptografado</span>
      )}
    </div>
  );
};

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

const submitQuickFeedback = async (
  sessionId: string,
  feedback: QuickFeedbackRequest,
): Promise<any> => {
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
      case 'user':
        return <User className='h-3 w-3' />;
      case 'calendar':
        return <Calendar className='h-3 w-3' />;
      case 'chart-bar':
        return <DollarSign className='h-3 w-3' />;
      case 'download':
        return <Download className='h-3 w-3' />;
      case 'refresh':
        return <RefreshCw className='h-3 w-3' />;
      case 'plus':
        return <Plus className='h-3 w-3' />;
      case 'help':
        return <MessageSquare className='h-3 w-3' />;
      default:
        return <ExternalLink className='h-3 w-3' />;
    }
  };

  return (
    <NeumorphicButton
      variant={action.primary ? 'primary' : 'neutral'}
      size='sm'
      onClick={() => onExecute(action)}
      className='flex items-center gap-2 text-xs'
      aria-label={action.description || action.label}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExecute(action);
        }
      }}
    >
      {action.icon && getIcon(action.icon)}
      <span>{action.label}</span>
    </NeumorphicButton>
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
    mutationFn: (helpful: boolean) =>
      submitQuickFeedback(sessionId, {
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
    <div className='flex items-center gap-2 mt-2' role="group" aria-label="Avaliação da resposta">
      <div className='flex gap-1'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NeumorphicButton
                variant='soft'
                size='sm'
                onClick={() => handleQuickFeedback(true)}
                disabled={submitQuickFeedbackMutation.isPending}
                className='h-6 w-6 p-0 text-muted-foreground hover:text-green-600'
                aria-label="Marcar resposta como útil"
                role="button"
                tabIndex={0}
              >
                <ThumbsUp className='h-3 w-3' aria-hidden="true" />
              </NeumorphicButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NeumorphicButton
                variant='soft'
                size='sm'
                onClick={() => handleQuickFeedback(false)}
                disabled={submitQuickFeedbackMutation.isPending}
                className='h-6 w-6 p-0 text-muted-foreground hover:text-red-600'
                aria-label="Marcar resposta como não útil"
                role="button"
                tabIndex={0}
              >
                <ThumbsDown className='h-3 w-3' aria-hidden="true" />
              </NeumorphicButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta não útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={showDetailedFeedback} onOpenChange={setShowDetailedFeedback}>
        <DialogTrigger asChild>
          <NeumorphicButton 
            variant='soft' 
            size='sm' 
            className='h-6 text-xs text-muted-foreground'
            aria-label="Abrir avaliação detalhada"
            role="button"
          >
            Detalhes
          </NeumorphicButton>
        </DialogTrigger>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Avaliar Resposta</DialogTitle>
            <DialogDescription>
              Sua avaliação nos ajuda a melhorar o atendimento
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label 
                className='text-sm font-medium' 
                id="rating-label"
                htmlFor="rating-group"
              >
                Nota (1-5 estrelas)
              </label>
              <div 
                className='flex gap-1 mt-1' 
                role="radiogroup" 
                aria-labelledby="rating-label"
                id="rating-group"
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <NeumorphicButton
                    key={star}
                    variant='soft'
                    size='sm'
                    onClick={() => setRating(star)}
                    className={cn(
                      'h-8 w-8 p-0',
                      rating >= star ? 'text-yellow-500' : 'text-muted-foreground',
                    )}
                    aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                    aria-pressed={rating >= star}
                    role="radio"
                    aria-checked={rating === star}
                    tabIndex={rating === star ? 0 : -1}
                  >
                    ⭐
                  </NeumorphicButton>
                ))}
              </div>
            </div>

            <div>
              <label 
                className='text-sm font-medium'
                htmlFor="feedback-comment"
              >
                Comentário (opcional)
              </label>
              <NeumorphicTextarea
                id="feedback-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder='Como podemos melhorar?'
                className='mt-1'
                rows={3}
                variant="light"
                aria-describedby="comment-help"
              />
              <p id="comment-help" className="text-xs text-muted-foreground mt-1">
                Seus comentários nos ajudam a melhorar o atendimento
              </p>
            </div>

            <div className='flex gap-2'>
              <NeumorphicButton
                onClick={handleDetailedFeedback}
                disabled={rating === 0 || submitDetailedFeedbackMutation.isPending}
                variant="primary"
                className='flex-1'
                aria-label="Enviar avaliação detalhada"
              >
                {submitDetailedFeedbackMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
              </NeumorphicButton>
              <NeumorphicButton 
                variant='neutral' 
                onClick={() => setShowDetailedFeedback(false)}
                aria-label="Cancelar avaliação"
              >
                Cancelar
              </NeumorphicButton>
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
          <NeumorphicCard key={index} variant="inset" size="sm" className='p-3'>
            <div className='font-medium text-sm text-[#112031]'>{item.name}</div>
            <div className='text-xs text-[#B4AC9C] mt-1'>
              {item.email} • <PatientStatusBadge status={item.status || 'active'} />
            </div>
          </NeumorphicCard>
        );

      case 'appointments':
        return (
          <NeumorphicCard key={index} variant="inset" size="sm" className='p-3'>
            <div className='font-medium text-sm text-[#112031]'>{item.clientName}</div>
            <div className='text-xs text-[#B4AC9C] mt-1'>
              {formatDateTime(item.scheduledAt)} • {item.serviceName}
            </div>
            <div className='mt-2'>
              <PatientStatusBadge 
                status={item.status === 'confirmed' ? 'active' : item.status === 'cancelled' ? 'inactive' : 'pending'}
                className='text-xs'
              />
            </div>
          </NeumorphicCard>
        );

      case 'financial':
        return (
          <NeumorphicCard key={index} variant="inset" size="sm" className='p-3'>
            <div className='font-medium text-sm text-[#112031]'>{item.clientName}</div>
            <div className='text-xs text-[#B4AC9C] mt-1'>
              {item.serviceName} • <span className='font-semibold text-[#AC9469]'>{formatCurrency(item.amount)}</span>
            </div>
            <div className='mt-2'>
              <PatientStatusBadge
                status={item.status === 'paid' ? 'completed' : item.status === 'pending' ? 'pending' : 'urgent'}
                className='text-xs'
              />
            </div>
          </NeumorphicCard>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <NeumorphicCard variant="patient" className='mt-3' role="region" aria-label={title}>
      <div className='pb-2'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-[#112031]'>{title}</h3>
          <PatientStatusBadge 
            status="active" 
            className='text-xs bg-gradient-to-r from-[#AC9469] to-[#d2aa60ff]'
          >
            {data.length} {data.length === 1 ? 'item' : 'itens'}
          </PatientStatusBadge>
        </div>
        {summary && (
          <p className='text-xs text-[#B4AC9C] mt-1'>
            {type === 'financial' && <span>Total: {formatCurrency(summary.total)}</span>}
          </p>
        )}
      </div>
      <div className='pt-0'>
        <div className='space-y-2'>
          {data.slice(0, expanded ? data.length : displayLimit).map((item, index) =>
            renderItem(item, index)
          )}

          {data.length > displayLimit && (
            <NeumorphicButton
              variant='soft'
              size='sm'
              onClick={() => setExpanded(!expanded)}
              className='w-full justify-center text-xs'
              aria-expanded={expanded}
              aria-label={expanded ? 'Ver menos itens' : `Ver mais ${data.length - displayLimit} itens`}
            >
              {expanded ? 'Ver menos' : `Ver mais ${data.length - displayLimit} itens`}
              <ChevronDown
                className={cn('h-3 w-3 ml-1 transition-transform', expanded && 'rotate-180')}
                aria-hidden="true"
              />
            </NeumorphicButton>
          )}
        </div>
      </div>
    </NeumorphicCard>
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

  // Enhanced accessibility and performance tracking
  const { 
    isHighContrast, 
    fontSize, 
    reducedMotion,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize 
  } = useHealthcareAccessibility();
  
  const { trackStep, startTiming } = useHealthcareWorkflowTracking();

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

  const { client: aguiClient, state: aguiState, session: aguiSession } = useAGUIProtocol(
    aguiConfig,
  );

  // Connect to AG-UI Protocol when component mounts
  useEffect(() => {
    aguiClient.connect();

    // Handle AG-UI Protocol events
    const handleMessage = (message: any) => {
      const assistantMessage: ChatMessage = {
        id: message.id,
        role: 'assistant',
        content: message.content,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
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
        timestamp: new Date(),
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
    onSuccess: data => {
      if (data.success && data.chatState?.messages) {
        const normalized = data.chatState.messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(normalized);
      }
    },
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: data => {
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
    onSuccess: response => {
      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          id: response.response.id,
          role: 'assistant',
          content: response.response.message,
          timestamp: response.response.timestamp
            ? new Date(response.response.timestamp)
            : new Date(),
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
    onError: error => {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
        timestamp: new Date(),
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

  // Enhanced send message with performance tracking
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue.trim();
    const workflowStartTime = startTiming();

    // Track query processing start
    trackStep('query_processing', workflowStartTime);

    // Create session if none exists
    if (!currentSessionId) {
      const sessionStartTime = startTiming();
      await createSessionMutation.mutateAsync({
        title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
        domain: userContext.domain,
        metadata: {
          userRole: userContext.userRole,
          initialQuery: query,
          accessibility: {
            highContrast: isHighContrast,
            fontSize,
            reducedMotion,
          },
        },
      });
      trackStep('session_creation', sessionStartTime);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Try to send via AG-UI Protocol first, fallback to HTTP API
    try {
      const dataRetrievalStartTime = startTiming();
      
      if (aguiClient.isConnected()) {
        await aguiClient.sendMessage(query, 'text', {
          sessionId: currentSessionId,
          userRole: userContext.userRole,
          domain: userContext.domain,
          accessibility: {
            highContrast: isHighContrast,
            fontSize,
            reducedMotion,
          },
        });

        // Update session context with user role and accessibility preferences
        updateAGUISessionContext({
          userRole: userContext.userRole,
          domain: userContext.domain,
          lastQuery: query,
          accessibility: {
            highContrast: isHighContrast,
            fontSize,
            reducedMotion,
          },
        });
        
        trackStep('data_retrieval', dataRetrievalStartTime);
      } else {
        // Fallback to HTTP API
        sendMessageMutation.mutate({
          query,
          sessionId: currentSessionId || undefined,
          userContext: {
            ...userContext,
            accessibility: {
              highContrast: isHighContrast,
              fontSize,
              reducedMotion,
            },
          },
        });
        
        trackStep('data_retrieval', dataRetrievalStartTime);
      }
    } catch (error) {
      console.error('Error sending message via AG-UI Protocol, falling back to HTTP:', error);
      trackStep('error_handling', startTiming());
      
      // Fallback to HTTP API
      sendMessageMutation.mutate({
        query,
        sessionId: currentSessionId || undefined,
        userContext,
      });
    }
  }, [
    inputValue,
    isLoading,
    currentSessionId,
    userContext,
    aguiClient,
    createSessionMutation,
    sendMessageMutation,
    updateAGUISessionContext,
  ]);

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
    <ClinicalActionPanel
      title="Consulta de Dados"
      subtitle={`Usuário: ${userContext.userRole}`}
      className={cn(
        'flex flex-col w-full',
        mode === 'inline' ? 'h-full' : 'w-96 h-[500px]',
        mobileOptimized && 'touch-manipulation',
        'overflow-hidden',
      )}
      data-testid={testId}
      role="application"
      aria-label="Interface de consulta de dados do sistema NeonPro"
    >
      {/* Enhanced Header with Security Indicators */}
      <div className='pb-3 border-b border-[#B4AC9C]/20 bg-gradient-to-r from-[#AC9469]/5 to-[#112031]/5 rounded-t-2xl'>
        {/* Security Status Bar */}
        <div className='px-4 py-2 bg-[#F6F5F2]/50 border-b border-[#B4AC9C]/10'>
          <SecurityStatusIndicator />
        </div>
        
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] shadow-[2px_2px_4px_#8d7854,_-2px_-2px_4px_#cbb07e]'>
              <Brain className='h-5 w-5 text-white' aria-hidden="true" />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-lg font-semibold text-[#112031]'>
                Assistente de Dados
              </h1>
              <p className='text-xs text-[#B4AC9C]'>Sistema NeonPro</p>
            </div>
            <div className='block sm:hidden'>
              <h1 className='text-sm font-semibold text-[#112031]'>
                NeonPro IA
              </h1>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* Mobile-optimized user badge */}
            <PatientStatusBadge 
              status="active" 
              className={cn(
                'text-xs bg-gradient-to-r from-[#112031] to-[#294359] text-white',
                mobileOptimized && 'hidden sm:inline-flex'
              )}
            >
              {userContext.userRole}
            </PatientStatusBadge>
            
            {/* Mobile user indicator */}
            {mobileOptimized && (
              <div className='sm:hidden w-8 h-8 rounded-full bg-gradient-to-br from-[#112031] to-[#294359] flex items-center justify-center'>
                <span className='text-xs text-white font-bold'>
                  {userContext.userRole.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <NeumorphicButton 
                  variant='soft' 
                  size='sm' 
                  className='h-8 w-8 p-0' 
                  aria-label="Menu de opções"
                >
                  <MoreHorizontal className='h-4 w-4' aria-hidden="true" />
                </NeumorphicButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className='h-4 w-4 mr-2' aria-hidden="true" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    onSessionChange?.(null);
                  }}
                  className='text-destructive'
                >
                  <RefreshCw className='h-4 w-4 mr-2' aria-hidden="true" />
                  Nova Conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 flex flex-col p-0'>
        <ScrollArea
          className='flex-1 px-4'
          style={{ maxHeight: mode === 'inline' ? maxHeight : undefined }}
          role="log"
          aria-live="polite"
          aria-label="Histórico de conversas"
        >
          <div className='space-y-4 py-4'>
            {/* Welcome message with healthcare optimization */}
            {messages.length === 0 && !isLoadingSession && (
              <MedicalAlertCard
                alertType="info"
                title="Bem-vindo ao Assistente NeonPro"
                description="Sistema especializado para consultas de dados de clínicas estéticas"
                icon={
                  <div className='p-2 rounded-xl bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] shadow-[2px_2px_4px_#8d7854,_-2px_-2px_4px_#cbb07e]'>
                    <Search className='h-5 w-5 text-white' />
                  </div>
                }
                className='text-center'
              >
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-lg font-semibold mb-2 text-[#112031]'>
                      Como posso ajudar você hoje?
                    </h3>
                    <p className='text-sm text-[#B4AC9C] mb-4'>
                      Consulte informações sobre pacientes, procedimentos ou dados financeiros de forma segura
                    </p>
                  </div>
                  
                  {/* Mobile-optimized Healthcare quick actions */}
                  <div className={cn(
                    'grid gap-3',
                    mobileOptimized ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'
                  )}>
                    <NeumorphicCard 
                      variant="floating" 
                      size="sm" 
                      className={cn(
                        'p-4 text-center cursor-pointer transition-all duration-200',
                        mobileOptimized ? 
                          'active:scale-95 touch-manipulation min-h-[80px]' : 
                          'hover:scale-105'
                      )}
                      role="button"
                      tabIndex={0}
                      aria-label="Buscar pacientes no sistema"
                    >
                      <Users className='h-8 w-8 mx-auto mb-2 text-[#AC9469]' aria-hidden="true" />
                      <h4 className='font-medium text-xs text-[#112031]'>Buscar Pacientes</h4>
                      <p className='text-xs text-[#B4AC9C] mt-1'>Localizar registros de clientes</p>
                    </NeumorphicCard>
                    
                    <NeumorphicCard 
                      variant="floating" 
                      size="sm" 
                      className={cn(
                        'p-4 text-center cursor-pointer transition-all duration-200',
                        mobileOptimized ? 
                          'active:scale-95 touch-manipulation min-h-[80px]' : 
                          'hover:scale-105'
                      )}
                      role="button"
                      tabIndex={0}
                      aria-label="Consultar agendamentos e procedimentos"
                    >
                      <Calendar className='h-8 w-8 mx-auto mb-2 text-[#AC9469]' aria-hidden="true" />
                      <h4 className='font-medium text-xs text-[#112031]'>Agendamentos</h4>
                      <p className='text-xs text-[#B4AC9C] mt-1'>Consultar procedimentos</p>
                    </NeumorphicCard>
                    
                    <NeumorphicCard 
                      variant="floating" 
                      size="sm" 
                      className={cn(
                        'p-4 text-center cursor-pointer transition-all duration-200',
                        mobileOptimized ? 
                          'active:scale-95 touch-manipulation min-h-[80px]' : 
                          'hover:scale-105'
                      )}
                      role="button"
                      tabIndex={0}
                      aria-label="Consultar dados financeiros e faturamento"
                    >
                      <DollarSign className='h-8 w-8 mx-auto mb-2 text-[#AC9469]' aria-hidden="true" />
                      <h4 className='font-medium text-xs text-[#112031]'>Financeiro</h4>
                      <p className='text-xs text-[#B4AC9C] mt-1'>Relatórios e faturamento</p>
                    </NeumorphicCard>
                  </div>

                  {/* Example queries for healthcare */}
                  <div className='mt-4 p-3 bg-[#F6F5F2] rounded-xl'>
                    <h4 className='text-xs font-medium text-[#112031] mb-2'>Exemplos de consultas:</h4>
                    <div className='space-y-1 text-xs text-[#B4AC9C]'>
                      <p>• "Mostre os agendamentos de hoje"</p>
                      <p>• "Quais pacientes faltaram esta semana?"</p>
                      <p>• "Faturamento do mês de procedimentos de botox"</p>
                    </div>
                  </div>
                </div>
              </MedicalAlertCard>
            )}

            {/* Render messages */}
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role === 'assistant' && (
                  <div className='flex-shrink-0'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary/10 text-primary'>
                        <Bot className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                <NeumorphicCard
                  variant={message.role === 'user' ? 'floating' : 'inset'}
                  className={cn(
                    'px-4 py-3 transition-all duration-200',
                    mobileOptimized ? 'max-w-[85%] sm:max-w-[80%]' : 'max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] text-white'
                      : 'bg-[#F6F5F2] text-[#112031]',
                  )}
                  role="article"
                  aria-label={`Mensagem de ${message.role === 'user' ? 'usuário' : 'assistente'}`}
                >
                  <div className={cn(
                    'whitespace-pre-wrap',
                    mobileOptimized ? 'text-sm leading-relaxed' : 'text-sm',
                    message.role === 'user' ? 'text-white' : 'text-[#112031]'
                  )}>
                    {message.content}
                  </div>

                  {/* Render structured data */}
                  {message.data && (
                    <div className='mt-3 space-y-2'>
                      {message.data.clients && (
                        <DataSummaryCard
                          title='Clientes Encontrados'
                          data={message.data.clients}
                          type='clients'
                          summary={message.data.summary}
                        />
                      )}
                      {message.data.appointments && (
                        <DataSummaryCard
                          title='Agendamentos'
                          data={message.data.appointments}
                          type='appointments'
                          summary={message.data.summary}
                        />
                      )}
                      {message.data.financial && (
                        <DataSummaryCard
                          title='Dados Financeiros'
                          data={message.data.financial}
                          type='financial'
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

                  {/* Enhanced Message metadata with mobile optimization */}
                  <div className={cn(
                    'flex items-center justify-between mt-3 text-xs',
                    message.role === 'user' ? 'text-white/70' : 'text-[#B4AC9C]',
                    mobileOptimized && 'flex-col sm:flex-row gap-2 sm:gap-0'
                  )}>
                    <span className='flex items-center gap-1'>
                      <span className='sr-only'>Horário da mensagem:</span>
                      {formatDateTime(message.timestamp)}
                    </span>
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
                </NeumorphicCard>

                {message.role === 'user' && (
                  <div className='flex-shrink-0'>
                    <Avatar className={cn(
                      'h-8 w-8',
                      mobileOptimized && 'h-10 w-10 sm:h-8 sm:w-8'
                    )}>
                      <AvatarFallback className='bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] text-white'>
                        <User className='h-4 w-4' aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}

            {/* Enhanced Loading state with performance indicators */}
            {isLoading && (
              <div className='flex gap-3 justify-start' role="status" aria-live="polite">
                <div className='flex-shrink-0'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff]'>
                      <Bot className='h-4 w-4 animate-pulse text-white' aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <NeumorphicCard variant="inset" className='px-4 py-3'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex gap-1'>
                        <div className='w-2 h-2 bg-[#AC9469] rounded-full animate-bounce' />
                        <div
                          className='w-2 h-2 bg-[#AC9469] rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className='w-2 h-2 bg-[#AC9469] rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                      <span className='text-xs text-[#112031] font-medium'>
                        Processando consulta de dados...
                      </span>
                    </div>
                    
                    {/* Performance indicator */}
                    <div className='flex items-center gap-2 text-xs text-[#B4AC9C]'>
                      <div className='w-1 h-1 bg-green-500 rounded-full animate-pulse' />
                      <span>Conexão segura ativa</span>
                      <div className='w-1 h-1 bg-[#AC9469] rounded-full animate-pulse' />
                      <span>LGPD compliant</span>
                    </div>
                    
                    {/* Progress bar for healthcare context */}
                    <div className='w-full bg-[#D2D0C8] rounded-full h-1.5'>
                      <div className='bg-gradient-to-r from-[#AC9469] to-[#d2aa60ff] h-1.5 rounded-full animate-pulse' style={{ width: '60%' }} />
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Enhanced Input Area with Healthcare Patterns */}
        <div className='border-t border-[#B4AC9C]/20 p-4 bg-gradient-to-r from-[#F6F5F2] to-[#D2D0C8]/50 backdrop-blur-sm rounded-b-2xl'>
          <div className='flex gap-3 items-end'>
            <div className='flex-1 relative'>
              <NeumorphicTextarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                variant="medical"
                className='min-h-[44px] max-h-32 resize-none'
                rows={1}
                aria-label="Digite sua consulta sobre dados do sistema"
                aria-describedby="input-help lgpd-notice"
              />
              {isLoading && (
                <div className='absolute right-3 top-3'>
                  <div className='flex gap-1'>
                    <div className='w-1 h-1 bg-[#AC9469] rounded-full animate-bounce' />
                    <div className='w-1 h-1 bg-[#AC9469] rounded-full animate-bounce' style={{ animationDelay: '0.1s' }} />
                    <div className='w-1 h-1 bg-[#AC9469] rounded-full animate-bounce' style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>

            <NeumorphicButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              variant="primary"
              size='clinical'
              className='px-4 min-w-[44px]'
              aria-label={isLoading ? 'Processando consulta...' : 'Enviar consulta'}
            >
              <Send className='h-4 w-4' aria-hidden="true" />
            </NeumorphicButton>
          </div>

          {/* Healthcare Input Help */}
          <p id="input-help" className='text-xs text-[#B4AC9C] mt-2 text-center'>
            💡 Dica: Use linguagem natural. Ex: "Pacientes agendados para amanhã"
          </p>

          {/* Enhanced LGPD Compliance Notice */}
          <div id="lgpd-notice" className='mt-3 p-3 bg-[#F6F5F2] rounded-xl border-l-4 border-l-[#AC9469]'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
              <p className='text-xs text-[#112031] font-medium'>
                Proteção de Dados (LGPD)
              </p>
            </div>
            <p className='text-xs text-[#B4AC9C] mt-1'>
              {lgpdConsent.canStoreHistory
                ? `✓ Conversa armazenada com segurança por ${lgpdConsent.dataRetentionDays} dias conforme LGPD`
                : '✓ Conversa não armazenada • Máxima privacidade conforme LGPD'}
            </p>
          </div>
        </div>
      </div>
    </ClinicalActionPanel>
  );

  // Enhanced interface with accessibility and performance monitoring
  const enhancedChatInterface = (
    <AccessibilityValidator
      enableRealTimeMonitoring={true}
      showAccessibilityIndicator={userContext.userRole === 'admin'}
      onAccessibilityUpdate={(status) => {
        // Log accessibility status for compliance
        console.log('Accessibility Status:', status);
      }}
    >
      <div 
        className='w-full h-full relative'
        style={{ fontSize: `${fontSize}px` }}
        data-high-contrast={isHighContrast}
        data-reduced-motion={reducedMotion}
      >
        {chatInterface}
        
        {/* Healthcare Workflow Performance Monitor */}
        <HealthcareWorkflowMonitor
          enableRealTimeMonitoring={true}
          showPerformanceIndicator={true}
          clinicalMode={userContext.userRole === 'admin' || userContext.userRole === 'professional'}
          targetResponseTime={2000}
          onPerformanceUpdate={(metrics) => {
            // Log performance metrics for optimization
            if (metrics.responseTime > 2000) {
              console.warn('Healthcare workflow performance degraded:', metrics);
            }
          }}
          onWorkflowUpdate={(workflow) => {
            // Track clinical workflow completion
            if (workflow.completionRate === 100) {
              console.log('Healthcare workflow completed:', workflow);
            }
          }}
        />
      </div>
    </AccessibilityValidator>
  );

  // Return popup or inline version
  if (mode === 'popup') {
    return (
      <CopilotPopup
        instructions='You are a healthcare data assistant for NeonPro. Help users query client data, appointments, and financial information in Portuguese. Prioritize accessibility and clinical workflow efficiency.'
        defaultOpen={false}
        clickOutsideToClose={true}
      >
        {enhancedChatInterface}
      </CopilotPopup>
    );
  }

  return enhancedChatInterface;
};

export default DataAgentChat;
