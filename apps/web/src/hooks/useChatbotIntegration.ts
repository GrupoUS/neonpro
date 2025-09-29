/**
 * Chatbot Integration Hook
 *
 * Main integration hook for chatbot agents to access all data with real-time capabilities
 * Combines all chatbot data access patterns into a single, easy-to-use interface
 */

import { useEffect, useState, useCallback } from 'react'
import { ChatbotAgentDataAccess, type ChatbotAgentContext, type AgentDataResponse } from '../services/chatbot-agent-data'
import useCopilotChat from '@copilotkit/react-core';
import {
  useChatbotNotifications,
  useChatbotServiceCategories,
  useChatbotAppointmentTemplates,
  useChatbotServiceTemplates,
  useChatbotProfessionalServices,
  useChatbotDashboard,
  useScheduleNotification,
} from './realtime/useChatbotRealtime'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Options {
  initialMessages?: ChatMessage[];
  context?: ChatbotAgentContext;
  enableRealtime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useChatbotIntegration(options: Options = {}) {
  const { initialMessages = [], context, enableRealtime = true, autoRefresh = true, refreshInterval = 30000 } = options;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const copilotChat = useCopilotChat({
    initialMessages: initialMessages.map(msg => ({ role: msg.role, content: msg.content })),
  });
  const { messages: copilotMessages, append, ...copilot } = copilotChat;

  // Call realtime hooks unconditionally with correct params
  const clinicId = context?.clinicId || 'default-clinic';
  const notifications = useChatbotNotifications({ clinicId, type: 'confirmation', limit: 10 });
  const serviceCategories = useChatbotServiceCategories(clinicId);
  const appointmentTemplates = useChatbotAppointmentTemplates(clinicId);
  const serviceTemplates = useChatbotServiceTemplates(clinicId);
  const professionalServices = useChatbotProfessionalServices({ clinicId });
  const dashboard = useChatbotDashboard(clinicId);
  const scheduleNotification = useScheduleNotification();

  // Use effect for side effects
  useEffect(() => {
    if (context && enableRealtime && notifications.data) {
      console.log('Realtime notifications updated', notifications.data);
    }
  }, [context, enableRealtime, notifications.data]);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    append([{ role: 'user', content }]);
  };

  const clearChat = () => {
    setMessages([]);
    // Reset CopilotChat if needed
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading: copilot.isLoading,
    context,
    notifications,
    serviceCategories,
    appointmentTemplates,
    serviceTemplates,
    professionalServices,
    dashboard,
    scheduleNotification,
    ...copilot,
  };
}

// Export convenience hook for basic chatbot usage
export function useBasicChatbot(clinicId: string, sessionId: string) {
  return useChatbotIntegration({
    context: {
      clinicId,
      sessionId,
      userRole: 'patient',
    },
    enableRealtime: true,
    autoRefresh: true,
    refreshInterval: 30000,
  })
}

// Export hook for advanced chatbot with full context
export function useAdvancedChatbot(context: ChatbotAgentContext, options?: {
  enableRealtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  return useChatbotIntegration({
    context,
    enableRealtime: options?.enableRealtime ?? true,
    autoRefresh: options?.autoRefresh ?? true,
    refreshInterval: options?.refreshInterval ?? 30000,
  })
}
