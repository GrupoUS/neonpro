/**
 * Chatbot Integration Hook
 * 
 * Main integration hook for chatbot agents to access all data with real-time capabilities
 * Combines all chatbot data access patterns into a single, easy-to-use interface
 */

import { useEffect, useState, useCallback } from 'react'
import { ChatbotAgentDataAccess, type ChatbotAgentContext, type AgentDataResponse } from '../services/chatbot-agent-data'
import {
  useChatbotNotifications,
  useChatbotServiceCategories,
  useChatbotAppointmentTemplates,
  useChatbotServiceTemplates,
  useChatbotProfessionalServices,
  useChatbotDashboard,
  useScheduleNotification,
} from './realtime/useChatbotRealtime'

export interface ChatbotIntegrationOptions {
  context: ChatbotAgentContext
  enableRealtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface ChatbotDataState {
  notifications: any[]
  serviceCategories: any[]
  appointmentTemplates: any[]
  serviceTemplates: any[]
  professionalServices: any[]
  dashboard: any
  isLoading: boolean
  error: string | null
}

/**
 * Main integration hook for chatbot agents
 * 
 * @example
 * ```typescript
 * const {
 *   data,
 *   agent,
 *   actions,
 *   isConnected
 * } = useChatbotIntegration({
 *   context: {
 *     clinicId: 'clinic-123',
 *     sessionId: 'session-456',
 *     userRole: 'patient'
 *   },
 *   enableRealtime: true
 * })
 * 
 * // Agent can now access all data
 * const notifications = await agent.getUpcomingNotifications()
 * const services = await agent.getServiceCategories()
 * 
 * // Or use real-time hooks
 * const { data: realtimeNotifications } = data.notifications
 * ```
 */
export function useChatbotIntegration(options: ChatbotIntegrationOptions) {
  const { context, enableRealtime = true, autoRefresh = true, refreshInterval = 30000 } = options

  // Initialize agent data access
  const [agent] = useState(() => new ChatbotAgentDataAccess(context))
  
  // Real-time hooks (only enabled if enableRealtime is true)
  const notificationsQuery = useChatbotNotifications(
    enableRealtime ? { status: 'scheduled', limit: 20 } : undefined
  )
  
  const serviceCategoriesQuery = useChatbotServiceCategories(
    context.clinicId,
    enableRealtime ? { includeStats: true } : undefined
  )
  
  const appointmentTemplatesQuery = useChatbotAppointmentTemplates(
    context.clinicId,
    enableRealtime ? { isActive: true } : undefined
  )
  
  const serviceTemplatesQuery = useChatbotServiceTemplates(
    context.clinicId,
    enableRealtime ? { isActive: true } : undefined
  )
  
  const professionalServicesQuery = useChatbotProfessionalServices(
    enableRealtime ? { clinicId: context.clinicId, isActive: true } : undefined
  )
  
  const dashboardQuery = useChatbotDashboard(context.clinicId)
  
  const scheduleNotificationMutation = useScheduleNotification()

  // Connection status
  const isConnected = enableRealtime ? 
    !notificationsQuery.isError && 
    !serviceCategoriesQuery.isError && 
    !dashboardQuery.isError : 
    true

  // Aggregate loading state
  const isLoading = enableRealtime ? (
    notificationsQuery.isLoading ||
    serviceCategoriesQuery.isLoading ||
    appointmentTemplatesQuery.isLoading ||
    serviceTemplatesQuery.isLoading ||
    professionalServicesQuery.isLoading ||
    dashboardQuery.isLoading
  ) : false

  // Aggregate error state
  const error = enableRealtime ? (
    notificationsQuery.error?.message ||
    serviceCategoriesQuery.error?.message ||
    appointmentTemplatesQuery.error?.message ||
    serviceTemplatesQuery.error?.message ||
    professionalServicesQuery.error?.message ||
    dashboardQuery.error?.message ||
    null
  ) : null

  // Data state
  const data: ChatbotDataState = {
    notifications: notificationsQuery.data || [],
    serviceCategories: serviceCategoriesQuery.data || [],
    appointmentTemplates: appointmentTemplatesQuery.data || [],
    serviceTemplates: serviceTemplatesQuery.data || [],
    professionalServices: professionalServicesQuery.data || [],
    dashboard: dashboardQuery.data || {},
    isLoading,
    error,
  }

  // Actions for the chatbot
  const actions = {
    /**
     * Schedule notification via agent
     */
    scheduleNotification: useCallback(async (notification: {
      type: 'reminder_24h' | 'reminder_1h' | 'confirmation' | 'followup'
      recipientEmail?: string
      recipientPhone?: string
      title: string
      message: string
      scheduledFor: Date
      metadata?: Record<string, any>
    }): Promise<AgentDataResponse> => {
      try {
        if (enableRealtime) {
          const result = await scheduleNotificationMutation.mutateAsync({
            notificationType: notification.type,
            recipientEmail: notification.recipientEmail,
            recipientPhone: notification.recipientPhone,
            title: notification.title,
            message: notification.message,
            scheduledFor: notification.scheduledFor,
            metadata: notification.metadata,
          })
          return {
            data: result,
            success: true,
            message: 'Notificação agendada com sucesso!',
            context: {
              source: 'realtime_mutation',
              timestamp: new Date().toISOString(),
              compliance: { lgpd: true, anvisa: true, cfm: true }
            }
          }
        } else {
          return await agent.scheduleNotification(notification)
        }
      } catch (error: any) {
        return {
          data: null,
          success: false,
          message: error.message || 'Erro ao agendar notificação',
          context: {
            source: 'error',
            timestamp: new Date().toISOString(),
            compliance: { lgpd: true, anvisa: true, cfm: true }
          }
        }
      }
    }, [agent, scheduleNotificationMutation, enableRealtime]),

    /**
     * Get fresh data (bypasses cache)
     */
    refreshData: useCallback(async () => {
      if (enableRealtime) {
        await Promise.all([
          notificationsQuery.refetch(),
          serviceCategoriesQuery.refetch(),
          appointmentTemplatesQuery.refetch(),
          serviceTemplatesQuery.refetch(),
          professionalServicesQuery.refetch(),
          dashboardQuery.refetch(),
        ])
      }
    }, [
      enableRealtime,
      notificationsQuery,
      serviceCategoriesQuery,
      appointmentTemplatesQuery,
      serviceTemplatesQuery,
      professionalServicesQuery,
      dashboardQuery
    ]),

    /**
     * Search across all data
     */
    searchData: useCallback(async (query: string, options?: {
      entityTypes?: ('notifications' | 'categories' | 'templates' | 'professionals')[]
      limit?: number
    }): Promise<AgentDataResponse> => {
      return await agent.searchData(query, options)
    }, [agent]),

    /**
     * Get contextual help based on current conversation
     */
    getContextualHelp: useCallback((intent?: string): string[] => {
      const suggestions: string[] = []
      
      if (data.notifications.length > 0) {
        suggestions.push(`Há ${data.notifications.length} notificações agendadas`)
      }
      
      if (data.serviceCategories.length > 0) {
        suggestions.push(`A clínica oferece ${data.serviceCategories.length} categorias de serviços`)
      }
      
      if (data.appointmentTemplates.length > 0) {
        suggestions.push(`Há ${data.appointmentTemplates.length} tipos de agendamento disponíveis`)
      }

      if (intent === 'scheduling') {
        suggestions.push('Posso ajudar com agendamentos, reagendamentos ou cancelamentos')
      }

      if (intent === 'information') {
        suggestions.push('Posso fornecer informações sobre serviços, profissionais e horários')
      }

      return suggestions
    }, [data])
  }

  // Auto-refresh mechanism
  useEffect(() => {
    if (autoRefresh && enableRealtime && refreshInterval > 0) {
      const interval = setInterval(() => {
        actions.refreshData()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, enableRealtime, refreshInterval, actions.refreshData])

  // Log connection status changes
  useEffect(() => {
    console.log('[CHATBOT-INTEGRATION] Connection status changed:', {
      isConnected,
      isLoading,
      hasError: !!error,
      clinicId: context.clinicId,
      sessionId: context.sessionId,
    })
  }, [isConnected, isLoading, error, context.clinicId, context.sessionId])

  return {
    // Data access
    data,
    agent,
    actions,
    
    // Status
    isConnected,
    isLoading,
    error,
    
    // Real-time queries (for advanced usage)
    queries: enableRealtime ? {
      notifications: notificationsQuery,
      serviceCategories: serviceCategoriesQuery,
      appointmentTemplates: appointmentTemplatesQuery,
      serviceTemplates: serviceTemplatesQuery,
      professionalServices: professionalServicesQuery,
      dashboard: dashboardQuery,
    } : null,
    
    // Mutations
    mutations: {
      scheduleNotification: scheduleNotificationMutation,
    }
  }
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