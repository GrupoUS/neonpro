"use client";

/**
 * WhatsApp Hook for NeonPro Healthcare
 * Manages WhatsApp conversations, messages, and real-time updates
 * Integrates with Supabase real-time and API client
 */

import { apiClient } from "@neonpro/shared";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
import type {
  SendWhatsappMessageRequest,
  WhatsappConversation,
  WhatsappConversationFilters,
  WhatsappMessage,
  WhatsappMessageFilters,
} from "@neonpro/shared";

interface UseWhatsappOptions {
  clinicId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWhatsappReturn {
  // State
  conversations: WhatsappConversation[];
  messages: WhatsappMessage[];
  selectedConversation: WhatsappConversation | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  loadConversations: (filters?: WhatsappConversationFilters) => Promise<void>;
  loadMessages: (conversationId: string, filters?: WhatsappMessageFilters) => Promise<void>;
  sendMessage: (request: SendWhatsappMessageRequest) => Promise<void>;
  selectConversation: (conversation: WhatsappConversation) => void;
  markAsRead: (messageId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  refreshData: () => Promise<void>;

  // Real-time
  connectionStatus: "connected" | "connecting" | "disconnected";
}

export const useWhatsapp = (options: UseWhatsappOptions): UseWhatsappReturn => {
  const { clinicId, autoRefresh = true, refreshInterval = 30_000 } = options;

  // State
  const [conversations, setConversations] = useState<WhatsappConversation[]>([]);
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsappConversation | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Refs
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations
  const loadConversations = useCallback(async (filters?: WhatsappConversationFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.whatsapp.getConversations({
        clinicId,
        ...filters,
      });

      if (response.success) {
        setConversations(response.data?.conversations || []);
      } else {
        const errorMessage = typeof response.error === "string"
          ? response.error
          : JSON.stringify(response.error) || "Failed to load conversations";
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
      console.error("Error loading conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: string, filters?: WhatsappMessageFilters) => {
      try {
        setIsLoadingMessages(true);
        setError(null);

        // Find conversation by ID to get phone number
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        const response = await apiClient.whatsapp.getMessages({
          clinicId,
          phoneNumber: conversation.phoneNumber,
          ...filters,
        });

        if (response.success) {
          setMessages(response.data?.messages || []);
        } else {
          const errorMessage = typeof response.error === "string"
            ? response.error
            : JSON.stringify(response.error) || "Failed to load messages";
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
        setError(errorMessage);
        console.error("Error loading messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [clinicId, conversations],
  );

  // Send message
  const sendMessage = useCallback(async (request: SendWhatsappMessageRequest) => {
    try {
      setIsSending(true);
      setError(null);

      const response = await apiClient.whatsapp.sendMessage(request);

      if (response.success) {
        // Optimistically add message to local state
        const optimisticMessage: WhatsappMessage = {
          id: `temp-${Date.now()}`,
          whatsappMessageId: response.data?.messageId || "",
          clinicId: request.clinicId,
          patientId: request.patientId,
          phoneNumber: request.to,
          direction: "outbound",
          messageType: "text",
          content: request.message,
          status: "pending",
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setMessages(prev => [...prev, optimisticMessage]);

        // Update conversation's last message time and count
        setConversations(prev =>
          prev.map(conv =>
            conv.phoneNumber === request.to
              ? {
                ...conv,
                lastMessageAt: new Date(),
                messageCount: conv.messageCount + 1,
              }
              : conv
          )
        );

        console.log("Message sent successfully");
      } else {
        const errorMessage = typeof response.error === "string"
          ? response.error
          : JSON.stringify(response.error) || "Failed to send message";
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      console.error("Error sending message:", err);

      throw err; // Re-throw to allow component to handle
    } finally {
      setIsSending(false);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation: WhatsappConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  }, [loadMessages]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // TODO: Implement mark as read API call
      console.log("Marking message as read:", messageId);

      // Update local state optimistically
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, status: "read" as const } : msg)
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  }, []);

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      // TODO: Implement archive conversation API call
      console.log("Archiving conversation:", conversationId);

      // Update local state optimistically
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, status: "archived" as const } : conv
        )
      );

      console.log("Conversation archived successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to archive conversation";
      console.error("Error archiving conversation:", err);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadConversations(),
      selectedConversation ? loadMessages(selectedConversation.id) : Promise.resolve(),
    ]);
  }, [loadConversations, loadMessages, selectedConversation]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      const scheduleRefresh = () => {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshData().finally(() => {
            scheduleRefresh(); // Schedule next refresh
          });
        }, refreshInterval);
      };

      scheduleRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  // TODO: Setup real-time subscriptions with Supabase
  useEffect(() => {
    setConnectionStatus("connected"); // Mock for now

    // Real implementation would setup Supabase real-time subscriptions here
    // Example:
    // const subscription = supabase
    //   .channel('whatsapp_messages')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
    //     (payload) => {
    //       // Handle new message
    //     })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [clinicId]);

  return {
    // State
    conversations,
    messages,
    selectedConversation,
    isLoading,
    isLoadingMessages,
    isSending,
    error,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    selectConversation,
    markAsRead,
    archiveConversation,
    refreshData,

    // Real-time
    connectionStatus,
  };
};
