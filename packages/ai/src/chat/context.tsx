/**
 * Universal AI Chat Context for NeonPro Healthcare Platform
 * React Context + useReducer for state management
 * Leverages patterns from dashboard AI enhancement
 */

"use client";

import type {
  ChatAction,
  ChatAIInsights,
  ChatConfig,
  ChatInterface,
  ChatMessage,
  ChatSession,
  ChatState,
  PerformanceMetrics,
} from "@neonpro/types/ai-chat";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

// Initial State
const initialChatState: ChatState = {
  sessions: {},
  active_session_id: undefined,
  is_loading: false,
  is_streaming: false,
  error: undefined,
  connection_status: "disconnected",
  config: {
    interface_type: "external",
    ai_model: "gpt-4",
    language: "pt-BR",
    streaming_enabled: true,
    max_response_time: 30_000,
    compliance_level: "medical",
    features: {
      real_time_streaming: true,
      voice_support: false,
      image_analysis: true,
      document_processing: true,
      appointment_scheduling: true,
      medical_knowledge_base: true,
      emergency_detection: true,
      no_show_prevention: true,
      multi_language_support: true,
      human_handoff: true,
    },
  },
  insights: undefined,
  performance_metrics: undefined,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "START_SESSION": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session.id]: action.payload.session,
        },
        active_session_id: action.payload.session.id,
        connection_status: "connected",
        error: undefined,
      };
    }

    case "END_SESSION": {
      const updatedSessions = { ...state.sessions };
      if (updatedSessions[action.payload.session_id]) {
        updatedSessions[action.payload.session_id] = {
          ...updatedSessions[action.payload.session_id],
          status: "ended",
          ended_at: new Date(),
        };
      }
      return {
        ...state,
        sessions: updatedSessions,
        active_session_id:
          state.active_session_id === action.payload.session_id
            ? undefined
            : state.active_session_id,
      };
    }

    case "SEND_MESSAGE": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            messages: [
              ...state.sessions[action.payload.session_id].messages,
              action.payload.message,
            ],
            updated_at: new Date(),
          },
        },
        is_loading: true,
      };
    }

    case "RECEIVE_MESSAGE": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            messages: [
              ...state.sessions[action.payload.session_id].messages,
              action.payload.message,
            ],
            updated_at: new Date(),
          },
        },
        is_loading: false,
        is_streaming: false,
      };
    }

    case "UPDATE_MESSAGE": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            messages: state.sessions[action.payload.session_id].messages.map(
              (msg) =>
                msg.id === action.payload.message_id
                  ? { ...msg, ...action.payload.updates }
                  : msg,
            ),
            updated_at: new Date(),
          },
        },
      };
    }

    case "START_STREAMING": {
      return {
        ...state,
        is_streaming: true,
        is_loading: false,
      };
    }

    case "STREAM_CHUNK": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            messages: state.sessions[action.payload.session_id].messages.map(
              (msg) =>
                msg.id === action.payload.message_id
                  ? {
                      ...msg,
                      content: msg.content + action.payload.chunk,
                      streaming: true,
                    }
                  : msg,
            ),
            updated_at: new Date(),
          },
        },
      };
    }

    case "END_STREAMING": {
      return {
        ...state,
        is_streaming: false,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            messages: state.sessions[action.payload.session_id].messages.map(
              (msg) =>
                msg.id === action.payload.message_id
                  ? { ...msg, streaming: false, status: "delivered" }
                  : msg,
            ),
            updated_at: new Date(),
          },
        },
      };
    }

    case "SET_LOADING": {
      return {
        ...state,
        is_loading: action.payload,
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload,
        is_loading: false,
        is_streaming: false,
        connection_status: action.payload ? "error" : state.connection_status,
      };
    }

    case "UPDATE_CONNECTION_STATUS": {
      return {
        ...state,
        connection_status: action.payload,
      };
    }

    case "UPDATE_CONFIG": {
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };
    }

    case "UPDATE_INSIGHTS": {
      return {
        ...state,
        insights: action.payload,
      };
    }

    case "UPDATE_METRICS": {
      return {
        ...state,
        performance_metrics: action.payload,
      };
    }

    case "ESCALATE_SESSION": {
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.session_id]: {
            ...state.sessions[action.payload.session_id],
            status: "escalated",
            escalated_to: action.payload.escalation.escalation_type,
            updated_at: new Date(),
          },
        },
      };
    }

    default: {
      return state;
    }
  }
}

// Context
interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;

  // Session Management
  startSession: (interfaceType: ChatInterface) => Promise<string>;
  endSession: (sessionId: string) => Promise<void>;
  setActiveSession: (sessionId: string) => void;

  // Message Management
  sendMessage: (
    content: string,
    type?: "text" | "voice" | "image",
  ) => Promise<void>;
  streamMessage: (content: string) => Promise<void>;

  // Configuration
  updateConfig: (config: Partial<ChatConfig>) => void;
  switchInterface: (interfaceType: ChatInterface) => void;

  // AI Features
  getInsights: () => ChatAIInsights | null;
  getMetrics: () => PerformanceMetrics | null;

  // Utilities
  getCurrentSession: () => ChatSession | null;
  getSessionHistory: (sessionId?: string) => ChatMessage[];
  isConnected: () => boolean;
  hasActiveSession: () => boolean;
}

const ChatContext = createContext<ChatContextType | null>(undefined);

// Provider
interface ChatProviderProps {
  children: React.ReactNode;
  initialInterface?: ChatInterface;
  apiBaseUrl?: string;
}

export function ChatProvider({
  children,
  initialInterface = "external",
  apiBaseUrl = "/api/ai/chat",
}: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    config: {
      ...initialChatState.config,
      interface_type: initialInterface,
    },
  });

  // Session Management
  const startSession = useCallback(
    async (interfaceType: ChatInterface): Promise<string> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "UPDATE_CONNECTION_STATUS", payload: "connecting" });

        const response = await fetch(`${apiBaseUrl}/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interface_type: interfaceType }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const { session } = await response.json();

        dispatch({ type: "START_SESSION", payload: { session } });
        dispatch({ type: "SET_LOADING", payload: false });

        return session.id;
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: (error as Error).message });
        throw error;
      }
    },
    [apiBaseUrl],
  );

  const endSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await fetch(`${apiBaseUrl}/session/${sessionId}`, {
          method: "DELETE",
        });

        dispatch({ type: "END_SESSION", payload: { session_id: sessionId } });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: (error as Error).message });
        throw error;
      }
    },
    [apiBaseUrl],
  );

  const setActiveSession = useCallback(
    (sessionId: string) => {
      if (state.sessions[sessionId]) {
        dispatch({
          type: "START_SESSION",
          payload: { session: state.sessions[sessionId] },
        });
      }
    },
    [state.sessions],
  );

  // Message Management
  const sendMessage = useCallback(
    async (
      content: string,
      type: "text" | "voice" | "image" = "text",
    ): Promise<void> => {
      if (!state.active_session_id) {
        throw new Error("No active session");
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const userMessage: ChatMessage = {
        id: messageId,
        role: "user",
        content,
        type,
        status: "sending",
        timestamp: new Date(),
      };

      dispatch({
        type: "SEND_MESSAGE",
        payload: { session_id: state.active_session_id, message: userMessage },
      });

      try {
        const response = await fetch(`${apiBaseUrl}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: state.active_session_id,
            message: userMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            session_id: state.active_session_id,
            message_id: messageId,
            updates: { status: "sent" },
          },
        });
      } catch (error) {
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            session_id: state.active_session_id,
            message_id: messageId,
            updates: { status: "error" },
          },
        });
        throw error;
      }
    },
    [state.active_session_id, apiBaseUrl],
  );

  const streamMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!state.active_session_id) {
        throw new Error("No active session");
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const userMessage: ChatMessage = {
        id: messageId,
        role: "user",
        content,
        type: "text",
        status: "sending",
        timestamp: new Date(),
      };

      dispatch({
        type: "SEND_MESSAGE",
        payload: { session_id: state.active_session_id, message: userMessage },
      });

      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        type: "text",
        status: "sending",
        timestamp: new Date(),
        streaming: true,
      };

      dispatch({
        type: "RECEIVE_MESSAGE",
        payload: {
          session_id: state.active_session_id,
          message: assistantMessage,
        },
      });

      try {
        dispatch({
          type: "START_STREAMING",
          payload: {
            session_id: state.active_session_id,
            message_id: assistantMessageId,
          },
        });

        const response = await fetch(`${apiBaseUrl}/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: state.active_session_id,
            message: userMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to stream message");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = new TextDecoder().decode(value);
          dispatch({
            type: "STREAM_CHUNK",
            payload: {
              session_id: state.active_session_id,
              message_id: assistantMessageId,
              chunk,
            },
          });
        }

        dispatch({
          type: "END_STREAMING",
          payload: {
            session_id: state.active_session_id,
            message_id: assistantMessageId,
          },
        });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: (error as Error).message });
        throw error;
      }
    },
    [state.active_session_id, apiBaseUrl],
  );

  // Configuration
  const updateConfig = useCallback((config: Partial<ChatConfig>) => {
    dispatch({ type: "UPDATE_CONFIG", payload: config });
  }, []);

  const switchInterface = useCallback(
    (interfaceType: ChatInterface) => {
      updateConfig({ interface_type: interfaceType });
    },
    [updateConfig],
  );

  // AI Features
  const getInsights = useCallback((): ChatAIInsights | null => {
    return state.insights;
  }, [state.insights]);

  const getMetrics = useCallback((): PerformanceMetrics | null => {
    return state.performance_metrics;
  }, [state.performance_metrics]);

  // Utilities
  const getCurrentSession = useCallback((): ChatSession | null => {
    return state.active_session_id
      ? state.sessions[state.active_session_id] || undefined
      : undefined;
  }, [state.active_session_id, state.sessions]);

  const getSessionHistory = useCallback(
    (sessionId?: string): ChatMessage[] => {
      const id = sessionId || state.active_session_id;
      return id ? state.sessions[id]?.messages || [] : [];
    },
    [state.active_session_id, state.sessions],
  );

  const isConnected = useCallback((): boolean => {
    return state.connection_status === "connected";
  }, [state.connection_status]);

  const hasActiveSession = useCallback((): boolean => {
    return state.active_session_id !== undefined && isConnected();
  }, [state.active_session_id, isConnected]);

  // Auto-connect effect
  useEffect(() => {
    if (
      !state.active_session_id &&
      state.connection_status === "disconnected"
    ) {
      startSession(state.config.interface_type).catch(console.error);
    }
  }, [
    startSession,
    state.active_session_id,
    state.connection_status,
    state.config.interface_type,
  ]);

  const contextValue: ChatContextType = {
    state,
    dispatch,
    startSession,
    endSession,
    setActiveSession,
    sendMessage,
    streamMessage,
    updateConfig,
    switchInterface,
    getInsights,
    getMetrics,
    getCurrentSession,
    getSessionHistory,
    isConnected,
    hasActiveSession,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

// Hook
export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export default ChatContext;
