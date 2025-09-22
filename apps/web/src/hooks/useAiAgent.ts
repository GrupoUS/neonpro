/**
 * useAiAgent Custom Hook (T039)
 * Provides a clean React interface for AI agent interactions
 *
 * Features:
 * - Session management with automatic creation/resumption
 * - Message sending with real-time updates
 * - Feedback collection and submission
 * - Error handling and retry logic
 * - LGPD compliance with consent management
 * - Integration with newly created API endpoints
 * - Optimistic updates for better UX
 * - Automatic session cleanup
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

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
} from '@neonpro/types';

// Types
export interface UseAiAgentOptions {
  /** Initial session ID to resume conversation */
  initialSessionId?: string;
  /** User context for role-based access */
  userContext: {
    _userId: string;
    userRole: 'admin' | 'professional' | 'assistant' | 'receptionist';
    domain?: string;
  };
  /** LGPD consent settings */
  lgpdConsent?: {
    canStoreHistory: boolean;
    dataRetentionDays: number;
  };
  /** Auto-create session on first message */
  autoCreateSession?: boolean;
  /** Callback when session changes */
  onSessionChange?: (sessionId: string | null) => void;
  /** Callback when new data is discovered */
  onDataDiscovered?: (data: {
    clients?: ClientData[];
    appointments?: AppointmentData[];
    financial?: FinancialData[];
  }) => void;
  /** Callback when errors occur */
  onError?: (error: Error) => void;
  /** Enable optimistic updates */
  optimisticUpdates?: boolean;
}

export interface UseAiAgentReturn {
  // State
  messages: ChatMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  isLoadingSession: boolean;
  error: Error | null;

  // Actions
  sendMessage: (_query: string, options?: {
    _context?: Record<string, any>;
    metadata?: Record<string, any>;
  }) => Promise<void>;
  createNewSession: (title?: string) => Promise<string>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;

  // Feedback
  submitFeedback: (messageId: string, feedback: {
    rating: number;
    comment?: string;
    category?: string;
    tags?: string[];
  }) => Promise<void>;
  submitQuickFeedback: (messageId: string, helpful: boolean) => Promise<void>;

  // Session management
  endCurrentSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;

  // Utils
  executeAction: (action: AgentAction) => void;
  lastUserMessage: ChatMessage | null;
  hasMessages: boolean;
}

interface SessionResponse {
  success: boolean;
  session: {
    id: string;
    _userId: string;
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
  category?: string;
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

const sendDataAgentQuery = async (_request: DataAgentRequest): Promise<DataAgentResponse> => {
  return apiCall('/data-agent', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

const createSession = async (_request: CreateSessionRequest): Promise<SessionResponse> => {
  return apiCall('/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

const getSession = async (sessionId: string): Promise<SessionResponse> => {
  return apiCall(`/sessions/${sessionId}`);
};

const updateSession = async (sessionId: string, updates: {
  title?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}): Promise<SessionResponse> => {
  return apiCall(`/sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

const deleteSession = async (sessionId: string): Promise<void> => {
  return apiCall(`/sessions/${sessionId}`, {
    method: 'DELETE',
  });
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
 * useAiAgent Hook
 * Provides comprehensive AI agent functionality for React components
 */
export const useAiAgent = (options: UseAiAgentOptions): UseAiAgentReturn => {
  const {
    initialSessionId,
    userContext,
    lgpdConsent = {
      canStoreHistory: true,
      dataRetentionDays: 30,
    },
    autoCreateSession = true,
    onSessionChange,
    onDataDiscovered,
    onError,
    optimisticUpdates = true,
  } = options;

  // State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Refs for stable references
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Query client for cache management
  const queryClient = useQueryClient();

  // Load existing session
  const { data: sessionData, isLoading: isLoadingSession, error: sessionError } = useQuery({
    queryKey: ['ai-session', currentSessionId],
    queryFn: () => getSession(currentSessionId!),
    enabled: !!currentSessionId,
    onSuccess: data => {
      if (data.success && data.chatState?.messages) {
        setMessages(data.chatState.messages);
      }
    },
    onError: (_err: any) => {
      setError(err);
      onError?.(err);
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: data => {
      if (data.success) {
        setCurrentSessionId(data.session.id);
        onSessionChange?.(data.session.id);
        queryClient.invalidateQueries({ queryKey: ['ai-session'] });

        // Send pending message if any
        if (pendingMessage) {
          sendMessageMutation.mutate({
            _query: pendingMessage,
            _context: {
              _userId: userContext.userId,
              domain: userContext.domain,
            },
          });
          setPendingMessage(null);
        }
      }
    },
    onError: (_err: any) => {
      setError(err);
      onError?.(err);
      setPendingMessage(null);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendDataAgentQuery,
    onMutate: async variables => {
      // Optimistic update
      if (optimisticUpdates) {
        const userMessage: ChatMessage = {
          id: `temp_user_${Date.now()}`,
          _role: 'user',
          content: variables.query,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
      }
      setError(null);
    },
    onSuccess: (response, variables) => {
      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          id: response.response.id,
          _role: 'assistant',
          content: response.response.message,
          timestamp: new Date().toISOString(),
          data: response.response.data,
          actions: response.response.actions,
        };

        setMessages(prev => {
          // Remove optimistic update if it exists
          const filteredMessages = optimisticUpdates
            ? prev.filter(msg => !msg.id.startsWith('temp_'))
            : prev;

          // Add user message (if not optimistic) and assistant response
          const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            _role: 'user',
            content: variables.query,
            timestamp: new Date().toISOString(),
          };

          return optimisticUpdates
            ? [...filteredMessages, userMessage, assistantMessage]
            : [...filteredMessages, userMessage, assistantMessage];
        });

        // Notify parent of discovered data
        if (response.response.data) {
          onDataDiscovered?.(response.response.data);
        }

        // Update session title if it's the first message
        if (messages.length === 0 && currentSessionId) {
          const title = variables.query.slice(0, 50) + (variables.query.length > 50 ? '...' : '');
          updateSession(currentSessionId, { title }).catch(console.warn);
        }
      }
    },
    onError: (err: Error, _variables) => {
      // Remove optimistic update on error
      if (optimisticUpdates) {
        setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      }

      setError(err);
      onError?.(err);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        _role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: any }) =>
      updateSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-session', currentSessionId] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      setCurrentSessionId(null);
      setMessages([]);
      onSessionChange?.(null);
      queryClient.invalidateQueries({ queryKey: ['ai-session'] });
    },
  });

  // Feedback mutations
  const feedbackMutation = useMutation({
    mutationFn: ({ sessionId, feedback }: { sessionId: string; feedback: FeedbackRequest }) =>
      submitFeedback(sessionId, feedback),
  });

  const quickFeedbackMutation = useMutation({
    mutationFn: ({ sessionId, feedback }: { sessionId: string; feedback: QuickFeedbackRequest }) =>
      submitQuickFeedback(sessionId, feedback),
  });

  // Callback functions
  const sendMessage = useCallback(async (
    _query: string,
    messageOptions?: {
      _context?: Record<string, any>;
      metadata?: Record<string, any>;
    },
  ) => {
    if (!query.trim()) return;

    // Create session if needed
    if (!currentSessionId && autoCreateSession) {
      setPendingMessage(query);
      createSessionMutation.mutate({
        title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
        domain: userContext.domain,
        metadata: {
          userRole: userContext.userRole,
          initialQuery: query,
          lgpdConsent: lgpdConsent.canStoreHistory,
          ...messageOptions?.metadata,
        },
      });
      return;
    }

    if (!currentSessionId) {
      throw new Error('No session available and auto-creation is disabled');
    }

    // Send message
    sendMessageMutation.mutate({
      _query: query.trim(),
      _context: {
        _userId: userContext.userId,
        domain: userContext.domain,
        ...messageOptions?.context,
      },
    });
  }, [
    currentSessionId,
    autoCreateSession,
    userContext,
    lgpdConsent,
    createSessionMutation,
    sendMessageMutation,
  ]);

  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    const response = await createSessionMutation.mutateAsync({
      title: title || 'Nova Conversa',
      domain: userContext.domain,
      metadata: {
        userRole: userContext.userRole,
        lgpdConsent: lgpdConsent.canStoreHistory,
      },
    });

    if (response.success) {
      return response.session.id;
    }
    throw new Error('Failed to create session');
  }, [createSessionMutation, userContext, lgpdConsent]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const submitFeedbackCallback = useCallback(async (
    messageId: string,
    feedback: {
      rating: number;
      comment?: string;
      category?: string;
      tags?: string[];
    },
  ) => {
    if (!currentSessionId) return;

    await feedbackMutation.mutateAsync({
      sessionId: currentSessionId,
      feedback: {
        ...feedback,
        metadata: { messageId },
      },
    });
  }, [currentSessionId, feedbackMutation]);

  const submitQuickFeedbackCallback = useCallback(async (
    messageId: string,
    helpful: boolean,
  ) => {
    if (!currentSessionId) return;

    await quickFeedbackMutation.mutateAsync({
      sessionId: currentSessionId,
      feedback: {
        messageId,
        helpful,
      },
    });
  }, [currentSessionId, quickFeedbackMutation]);

  const endCurrentSession = useCallback(async () => {
    if (currentSessionId) {
      await updateSessionMutation.mutateAsync({
        sessionId: currentSessionId,
        updates: { isActive: false },
      });
      setCurrentSessionId(null);
      setMessages([]);
      onSessionChange?.(null);
    }
  }, [currentSessionId, updateSessionMutation, onSessionChange]);

  const loadSession = useCallback(async (_sessionId: any) => {
    setCurrentSessionId(sessionId);
    onSessionChange?.(sessionId);
    // The useQuery will automatically load the session data
  }, [onSessionChange]);

  const executeAction = useCallback((_action: any) => {
    switch (action.type) {
      case 'view_details':
        if (action.payload?.clientId) {
          window.open(`/clientes/${action.payload.clientId}`, '_blank');
        }
        break;

      case 'create_appointment':
        window.open('/agendamentos/novo', '_blank');
        break;

      case 'export_data':
        // Trigger data export
        console.log('Export data action:', action._payload);
        break;

      case 'navigate':
        if (action.payload?.path) {
          window.open(action.payload.path, '_blank');
        }
        break;

      case 'refresh':
        retryLastMessage();
        break;

      default:
        console.log('Unknown action type:', action.type);
    }
  }, [retryLastMessage]);

  // Derived state
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user') || null;
  const hasMessages = messages.length > 0;
  const isLoading = sendMessageMutation.isPending || createSessionMutation.isPending;

  // Effect to handle session changes
  useEffect(() => {
    if (currentSessionId !== initialSessionId) {
      onSessionChange?.(currentSessionId);
    }
  }, [currentSessionId, initialSessionId, onSessionChange]);

  // Effect to handle session errors
  useEffect(() => {
    if (sessionError) {
      setError(sessionError as Error);
      onError?.(sessionError as Error);
    }
  }, [sessionError, onError]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setPendingMessage(null);
      setError(null);
    };
  }, []);

  return {
    // State
    messages,
    currentSessionId,
    isLoading,
    isLoadingSession,
    error,

    // Actions
    sendMessage,
    createNewSession,
    clearMessages,
    retryLastMessage,

    // Feedback
    submitFeedback: submitFeedbackCallback,
    submitQuickFeedback: submitQuickFeedbackCallback,

    // Session management
    endCurrentSession,
    loadSession,

    // Utils
    executeAction,
    lastUserMessage,
    hasMessages,
  };
};

export default useAiAgent;
