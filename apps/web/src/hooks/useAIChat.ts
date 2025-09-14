
import type { ChatMessage, ChatState } from '@/components/ui/ai-chat/types';
import {
  generateSearchSuggestions,
  generateVoiceOutput,
  logAIInteraction,
  processVoiceInput,
  streamAestheticResponse,
} from '@/lib/ai/ai-chat-service'; // path confirmed
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchDefaultChatModel } from '@/services/chat-settings.service';

// Session storage key for persistence
const CHAT_SESSION_KEY = 'neonpro-ai-chat-session';

/**
 * AI Chat Hook for NeonPro Aesthetic Clinic
 * Integrates with Vercel AI SDK, React Query, and local storage
 */
export function useAIChat(clientId?: string) {
  const queryClient = useQueryClient();
  const [sessionId] = useState(() => nanoid());
  const { user } = useAuth();

  // Chat state management
  const [chatState, setChatState] = useState<ChatState>(() => {
    // Load from session storage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(CHAT_SESSION_KEY);
      if (saved) {
        try {
          return { ...JSON.parse(saved), sessionId };
        } catch {
          // Fall through to default state
        }
      }
    }

    // Read persisted default model if available
    const persistedDefault = typeof window !== 'undefined'
      ? localStorage.getItem('neonpro-default-chat-model') || 'gpt-5-mini'
      : 'gpt-5-mini';

    return {
      messages: [],
      isLoading: false,
      error: null,
      sessionId,
      // Default model selection
      model: persistedDefault,
    } as ChatState & { model: string };
  });

  // Hydrate model from server when user is known
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const serverModel = await fetchDefaultChatModel(user.id);
      if (serverModel) {
        setChatState(prev => {
          const next = { ...(prev as ChatState & { model?: string }), model: serverModel } as ChatState;
          persistChatState(next);
          return next;
        });
        try { localStorage.setItem('neonpro-default-chat-model', serverModel); } catch {}
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Persist chat state to session storage
  const persistChatState = useCallback((state: ChatState) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(state));
    }
  }, []);

  // Model selection setter
  const setModel = useCallback((model: string) => {
    setChatState(prev => {
      const next = { ...(prev as ChatState & { model?: string }), model } as ChatState;
      persistChatState(next);
      return next;
    });
  }, [persistChatState]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const userMessage: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content,
        timestamp: new Date(),
        clientId,
        metadata: { model: (chatState as ChatState & { model?: string }).model },
      };

      // Add user message immediately
      const newState = {
        ...chatState,
        messages: [...chatState.messages, userMessage],
        isLoading: true,
        error: null,
      };
      setChatState(newState);
      persistChatState(newState);

      // Stream AI response
      const stream = await streamAestheticResponse(
        [
          ...chatState.messages,
          userMessage,
        ],
        clientId,
        (chatState as ChatState & { model?: string }).model,
        chatState.sessionId,
      );

      return { userMessage, stream };
    },
    onSuccess: async ({ userMessage, stream }) => {
      // Process streaming response
      const reader = stream.getReader();
      let aiContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode and accumulate response
          const chunk = new TextDecoder().decode(value);
          aiContent += chunk;

          // Update UI with partial response
          const aiMessage: ChatMessage = {
            id: nanoid(),
            role: 'assistant',
            content: aiContent,
            timestamp: new Date(),
            clientId,
          };

          const streamingState = {
            ...chatState,
            messages: [...chatState.messages, userMessage, aiMessage],
            isLoading: true,
          };
          setChatState(streamingState);
        }

        // Final state when streaming is complete
        const finalAiMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
          clientId,
        };

        const finalState = {
          ...chatState,
          messages: [...chatState.messages, userMessage, finalAiMessage],
          isLoading: false,
          error: null,
        };

        setChatState(finalState);
        persistChatState(finalState);

        // Log interaction for compliance
        logAIInteraction(sessionId, userMessage.content, aiContent, clientId);
      } catch (error) {
        console.error('Error processing AI stream:', error);
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao processar resposta da IA',
        }));
      }
    },
    onError: error => {
      console.error('Send message error:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    },
  });

  // Search suggestions query
  const {
    data: searchSuggestions = [],
    isLoading: suggestionsLoading,
  } = useQuery({
    queryKey: ['search-suggestions', chatState.messages.length],
    queryFn: async () => {
      const lastUserMessage = chatState.messages
        .filter(m => m.role === 'user')
        .pop();

      if (!lastUserMessage) return [];

      return generateSearchSuggestions(lastUserMessage.content, chatState.sessionId);
    },
    enabled: chatState.messages.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Voice input processing
  const processVoiceMutation = useMutation({
    mutationFn: processVoiceInput,
    onSuccess: transcript => {
      if (transcript) {
        sendMessageMutation.mutate(transcript);
      }
    },
  });

  // Clear chat history
  const clearChat = useCallback(() => {
    const clearedState: ChatState = {
      messages: [],
      isLoading: false,
      error: null,
      sessionId: nanoid(), // New session
    };

    setChatState(clearedState);
    persistChatState(clearedState);
    queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
  }, [queryClient, persistChatState]);

  // Retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = chatState.messages
      .filter(m => m.role === 'user')
      .pop();

    if (lastUserMessage) {
      // Remove messages after the last user message
      const messageIndex = chatState.messages.findIndex(m => m.id === lastUserMessage.id);
      const newMessages = chatState.messages.slice(0, messageIndex + 1);

      setChatState(prev => ({
        ...prev,
        messages: newMessages,
        error: null,
      }));

      sendMessageMutation.mutate(lastUserMessage.content);
    }
  }, [chatState.messages, sendMessageMutation]);

  return {
    // State
    messages: chatState.messages,
    isLoading: chatState.isLoading || sendMessageMutation.isPending,
    error: chatState.error,
    sessionId: chatState.sessionId,
    model: (chatState as ChatState & { model?: string }).model,

    // Search
    searchSuggestions,
    suggestionsLoading,

    // Actions
    sendMessage: sendMessageMutation.mutate,
    processVoice: processVoiceMutation.mutate,
    generateVoice: generateVoiceOutput,
    clearChat,
    retryLastMessage,
    setModel,

    // Mutation states
    sendMessageLoading: sendMessageMutation.isPending,
    voiceProcessingLoading: processVoiceMutation.isPending,
  } as const;
}
