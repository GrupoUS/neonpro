/**
 * AI Agent tRPC Integration
 *
 * Type-safe tRPC hooks for AI agent functionality
 * Integrates with the existing agent router backend
 */

import type { AppRouter } from '@neonpro/api';
import { createTRPCReact } from '@trpc/react-query';

// Create tRPC React instance
export const agentTRPC = createTRPCReact<AppRouter>();

// =====================================
// SESSION MANAGEMENT HOOKS
// =====================================

/**
 * Hook for creating new agent sessions
 */
export function useAgentSession() {
  return agentTRPC.agent.createSession.useMutation({
    onSuccess: data => {
      // Log successful session creation
      console.log('Agent session created:', data.data.id);
    },
    onError: error => {
      console.error('Failed to create agent session:', error);
    },
  });
}

/**
 * Hook for listing user's agent sessions
 */
export function useAgentSessions(params?: {
  agent_type?: 'client' | 'financial' | 'appointment';
  status?: 'active' | 'archived' | 'pending';
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}) {
  return agentTRPC.agent.listSessions.useQuery(
    {
      agent_type: params?.agent_type,
      status: params?.status,
      page: params?.page || 1,
      limit: params?.limit || 10,
      sort_by: params?.sort_by || 'created_at',
      sort_order: params?.sort_order || 'desc',
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );
}

/**
 * Hook for getting specific session details
 */
export function useAgentSessionDetail(
  sessionId: string,
  includeMessages: boolean = false,
) {
  return agentTRPC.agent.getSession.useQuery(
    {
      session_id: sessionId,
      include_messages: includeMessages,
    },
    {
      enabled: !!sessionId,
      staleTime: 30 * 1000, // 30 seconds for fresh messages
    },
  );
}

/**
 * Hook for archiving sessions
 */
export function useAgentArchiveSession() {
  return agentTRPC.agent.archiveSession.useMutation({
    onSuccess: () => {
      console.log('Agent session archived successfully');
    },
    onError: error => {
      console.error('Failed to archive agent session:', error);
    },
  });
}

// =====================================
// MESSAGE MANAGEMENT HOOKS
// =====================================

/**
 * Hook for sending messages to agents
 */
export function useAgentSendMessage() {
  const queryClient = agentTRPC.useUtils();

  return agentTRPC.agent.sendMessage.useMutation({
    onSuccess: (data, variables) => {
      // Invalidate session queries to get fresh messages
      queryClient.agent.getSession.invalidate({
        session_id: variables.session_id,
        include_messages: true,
      });

      console.log('Message sent successfully:', data.data.message.id);
    },
    onError: error => {
      console.error('Failed to send message:', error);
    },
  });
}

/**
 * Hook for getting agent messages with real-time updates
 */
export function useAgentMessages(
  sessionId: string | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) {
  const { data: sessionData, isLoading } = useAgentSessionDetail(
    sessionId,
    true,
  );

  return {
    messages: sessionData?.data?.messages || [],
    isLoading,
    session: sessionData?.data?.session,
  };
}

// =====================================
// KNOWLEDGE BASE HOOKS
// =====================================

/**
 * Hook for adding entries to knowledge base
 */
export function useAgentAddKnowledge() {
  const queryClient = agentTRPC.useUtils();

  return agentTRPC.agent.addKnowledge.useMutation({
    onSuccess: () => {
      // Invalidate knowledge search queries
      queryClient.agent.searchKnowledge.invalidate();
      console.log('Knowledge entry added successfully');
    },
    onError: error => {
      console.error('Failed to add knowledge entry:', error);
    },
  });
}

/**
 * Hook for searching knowledge base
 */
export function useAgentSearchKnowledge() {
  return agentTRPC.agent.searchKnowledge.useMutation({
    onSuccess: data => {
      console.log(`Found ${data.data.total_matches} knowledge entries`);
    },
    onError: error => {
      console.error('Failed to search knowledge base:', error);
    },
  });
}

/**
 * Hook for RAG (Retrieval-Augmented Generation) queries
 */
export function useAgentRAGQuery() {
  return agentTRPC.agent.ragQuery.useMutation({
    onSuccess: data => {
      console.log(`RAG query completed with ${data.results.length} results`);
    },
    onError: error => {
      console.error('Failed to perform RAG query:', error);
    },
  });
}

// =====================================
// ANALYTICS & MONITORING HOOKS
// =====================================

/**
 * Hook for getting agent analytics
 */
export function useAgentAnalytics(params?: {
  agent_type?: 'client' | 'financial' | 'appointment';
  start_date?: string;
  end_date?: string;
}) {
  return agentTRPC.agent.getAnalytics.useQuery(
    {
      agent_type: params?.agent_type,
      start_date: params?.start_date,
      end_date: params?.end_date,
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );
}

/**
 * Hook for real-time agent analytics
 */
export function useAgentRealtimeAnalytics(
  enabled: boolean = false,
  refreshInterval: number = 30000, // 30 seconds
) {
  return agentTRPC.agent.getAnalytics.useQuery(
    {},
    {
      enabled,
      refetchInterval: refreshInterval,
      staleTime: 10 * 1000, // 10 seconds
    },
  );
}

// =====================================
// UTILITY HOOKS
// =====================================

/**
 * Hook for agent session management
 */
export function useAgentSessionManager() {
  const createSession = useAgentSession();
  const archiveSession = useAgentArchiveSession();
  const [currentSessionId, setCurrentSessionId] = useState<string>();

  const startNewSession = useCallback(
    async (params: {
      agent_type: 'client' | 'financial' | 'appointment';
      initial_context?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await createSession.mutateAsync(params);
      setCurrentSessionId(result.data.id);
      return result;
    },
    [createSession],
  );

  const endCurrentSession = useCallback(
    async (reason: string) => {
      if (currentSessionId) {
        await archiveSession.mutateAsync({
          session_id: currentSessionId,
          reason,
        });
        setCurrentSessionId(undefined);
      }
    },
    [archiveSession, currentSessionId],
  );

  return {
    currentSessionId,
    setCurrentSessionId,
    startNewSession,
    endCurrentSession,
    isCreating: createSession.isPending,
    isArchiving: archiveSession.isPending,
  };
}

/**
 * Hook for agent chat interface
 */
export function useAgentChat(sessionId?: string) {
  const sendMessage = useAgentSendMessage();
  const { messages, isLoading } = useAgentMessages(sessionId);
  const ragQuery = useAgentRAGQuery();

  const sendUserMessage = useCallback(
    async (
      content: string,
      options?: {
        metadata?: Record<string, unknown>;
        attachments?: any[];
      },
    ) => {
      if (!sessionId) return;

      await sendMessage.mutateAsync({
        session_id: sessionId,
        role: 'user',
        content,
        metadata: options?.metadata,
        attachments: options?.attachments,
      });
    },
    [sendMessage, sessionId],
  );

  const performRAGSearch = useCallback(
    async (query: string, maxResults: number = 10) => {
      if (!sessionId) return;

      return ragQuery.mutateAsync({
        session_id: sessionId,
        query,
        max_results: maxResults,
      });
    },
    [ragQuery, sessionId],
  );

  return {
    messages,
    isLoading,
    sendMessage: sendUserMessage,
    performRAGSearch,
    isSending: sendMessage.isPending,
    isSearchingRAG: ragQuery.isPending,
  };
}

/**
 * Hook for knowledge base management
 */
export function useKnowledgeBaseManager() {
  const addKnowledge = useAgentAddKnowledge();
  const searchKnowledge = useAgentSearchKnowledge();

  const addEntry = useCallback(
    async (params: {
      agent_type: 'client' | 'financial' | 'appointment';
      title: string;
      content: string;
      source: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }) => {
      return addKnowledge.mutateAsync(params);
    },
    [addKnowledge],
  );

  const searchEntries = useCallback(
    async (params: {
      agent_type: 'client' | 'financial' | 'appointment';
      query: string;
      limit?: number;
    }) => {
      return searchKnowledge.mutateAsync({
        agent_type: params.agent_type,
        query: params.query,
        limit: params.limit || 10,
      });
    },
    [searchKnowledge],
  );

  return {
    addEntry,
    searchEntries,
    isAdding: addKnowledge.isPending,
    isSearching: searchKnowledge.isPending,
  };
}

// =====================================
// PREFETCHING UTILITIES
// =====================================

/**
 * Prefetch agent sessions for better performance
 */
export function prefetchAgentSessions(
  queryClient: ReturnType<typeof agentTRPC.useUtils>,
  params?: {
    agent_type?: 'client' | 'financial' | 'appointment';
    status?: 'active' | 'archived' | 'pending';
  },
) {
  return queryClient.agent.listSessions.prefetch({
    agent_type: params?.agent_type,
    status: params?.status,
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
}

/**
 * Prefetch agent session details
 */
export function prefetchAgentSession(
  queryClient: ReturnType<typeof agentTRPC.useUtils>,
  sessionId: string,
  includeMessages: boolean = false,
) {
  return queryClient.agent.getSession.prefetch(
    {
      session_id: sessionId,
      include_messages: includeMessages,
    },
    {
      staleTime: 30 * 1000,
    },
  );
}

/**
 * Prefetch agent analytics
 */
export function prefetchAgentAnalytics(
  queryClient: ReturnType<typeof agentTRPC.useUtils>,
  params?: {
    agent_type?: 'client' | 'financial' | 'appointment';
    start_date?: string;
    end_date?: string;
  },
) {
  return queryClient.agent.getAnalytics.prefetch({
    agent_type: params?.agent_type,
    start_date: params?.start_date,
    end_date: params?.end_date,
  });
}

// =====================================
// ERROR HANDLING UTILITIES
// =====================================

/**
 * Handle agent-related errors with user-friendly messages
 */
export function handleAgentError(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const errorData = error.data as any;

    switch (errorData?.code) {
      case 'UNAUTHORIZED':
        return 'Você não tem permissão para acessar este assistente.';
      case 'FORBIDDEN':
        return 'Acesso negado. Verifique suas permissões.';
      case 'NOT_FOUND':
        return 'Sessão não encontrada ou expirada.';
      case 'RATE_LIMITED':
        return 'Muitas solicitações. Por favor, aguarde um momento.';
      case 'INTERNAL_SERVER_ERROR':
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro. Por favor, tente novamente.';
    }
  }

  return 'Ocorreu um erro inesperado.';
}

// =====================================
// TYPES EXPORT
// =====================================

export type {
  AgentAnalytics,
  AgentMessageResponse,
  AgentSessionResponse,
  KnowledgeEntryResponse,
  RAGResponse,
} from '@neonpro/api';

// Import React if needed for useState
import { useCallback, useState } from 'react';
