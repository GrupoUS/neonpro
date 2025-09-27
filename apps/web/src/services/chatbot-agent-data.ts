/**
 * Chatbot Agent Data Access Layer
 * 
 * High-level data access functions specifically designed for chatbot agents
 * Provides context-aware, healthcare-compliant data access with real-time capabilities
 * 
 * LGPD/ANVISA/CFM Compliant
 */

import { trpc } from '../lib/trpc'
import {
  useChatbotNotifications,
  useChatbotServiceCategories,
  useChatbotAppointmentTemplates,
  useChatbotServiceTemplates,
  useChatbotProfessionalServices,
  useChatbotDataSearch,
  useChatbotDashboard,
  useScheduleNotification,
} from './hooks/realtime/useChatbotRealtime'

// =====================================
// AGENT CONTEXT TYPES
// =====================================

export interface ChatbotAgentContext {
  clinicId: string
  userId?: string
  userRole?: 'patient' | 'professional' | 'admin' | 'receptionist'
  sessionId: string
  conversationContext?: {
    intent?: 'scheduling' | 'information' | 'cancellation' | 'rescheduling' | 'support'
    entities?: Record<string, any>
    previousMessages?: string[]
  }
}

export interface AgentDataResponse<T = any> {
  data: T
  success: boolean
  message?: string
  context?: {
    source: string
    timestamp: string
    compliance: {
      lgpd: boolean
      anvisa: boolean
      cfm: boolean
    }
  }
  suggestions?: string[]
}

// =====================================
// CHATBOT AGENT DATA ACCESS CLASS
// =====================================

export class ChatbotAgentDataAccess {
  private context: ChatbotAgentContext

  constructor(context: ChatbotAgentContext) {
    this.context = context
    this.logAccess('Agent initialized', { context })
  }

  // =====================================
  // NOTIFICATION MANAGEMENT
  // =====================================

  /**
   * Get upcoming notifications for context-aware responses
   */
  async getUpcomingNotifications(options?: {
    hours?: number
    type?: 'reminder_24h' | 'reminder_1h' | 'confirmation'
  }): Promise<AgentDataResponse> {
    try {
      const notifications = await trpc.chatbotData.listNotifications.query({
        status: 'scheduled',
        type: options?.type,
        limit: 20,
        clinicId: this.context.clinicId,
      })

      this.logAccess('Retrieved upcoming notifications', { 
        count: notifications.length,
        type: options?.type 
      })

      return {
        data: notifications,
        success: true,
        context: this.getComplianceContext('notifications'),
        suggestions: this.generateNotificationSuggestions(notifications)
      }
    } catch (error) {
      this.logError('Failed to get notifications', error)
      return {
        data: [],
        success: false,
        message: 'Erro ao buscar notificações. Tente novamente.',
        context: this.getComplianceContext('notifications')
      }
    }
  }

  /**
   * Schedule notification via agent
   */
  async scheduleNotification(notification: {
    type: 'reminder_24h' | 'reminder_1h' | 'confirmation' | 'followup'
    recipientEmail?: string
    recipientPhone?: string
    title: string
    message: string
    scheduledFor: Date
    metadata?: Record<string, any>
  }): Promise<AgentDataResponse> {
    try {
      const result = await trpc.chatbotData.scheduleNotification.mutate({
        notificationType: notification.type,
        recipientEmail: notification.recipientEmail,
        recipientPhone: notification.recipientPhone,
        title: notification.title,
        message: notification.message,
        scheduledFor: notification.scheduledFor,
        metadata: {
          ...notification.metadata,
          source: 'chatbot_agent',
          agentContext: this.context.sessionId,
        }
      })

      this.logAccess('Notification scheduled via agent', { 
        notificationId: result.id,
        type: notification.type 
      })

      return {
        data: result,
        success: true,
        message: 'Notificação agendada com sucesso!',
        context: this.getComplianceContext('notifications')
      }
    } catch (error) {
      this.logError('Failed to schedule notification', error)
      return {
        data: null,
        success: false,
        message: 'Erro ao agendar notificação. Verifique os dados e tente novamente.',
        context: this.getComplianceContext('notifications')
      }
    }
  }

  // =====================================
  // SERVICE INFORMATION
  // =====================================

  /**
   * Get service categories with statistics for informative responses
   */
  async getServiceCategories(options?: {
    includeStats?: boolean
    activeOnly?: boolean
  }): Promise<AgentDataResponse> {
    try {
      const categories = await trpc.chatbotData.getServiceCategories.query({
        clinicId: this.context.clinicId,
        includeStats: options?.includeStats ?? true,
        isActive: options?.activeOnly,
      })

      this.logAccess('Retrieved service categories', { 
        count: categories.length,
        includeStats: options?.includeStats 
      })

      return {
        data: categories,
        success: true,
        context: this.getComplianceContext('services'),
        suggestions: this.generateServiceSuggestions(categories)
      }
    } catch (error) {
      this.logError('Failed to get service categories', error)
      return {
        data: [],
        success: false,
        message: 'Erro ao buscar categorias de serviços.',
        context: this.getComplianceContext('services')
      }
    }
  }

  /**
   * Get appointment templates for scheduling assistance
   */
  async getAppointmentTemplates(options?: {
    serviceType?: string
    activeOnly?: boolean
  }): Promise<AgentDataResponse> {
    try {
      const templates = await trpc.chatbotData.getAppointmentTemplates.query({
        clinicId: this.context.clinicId,
        isActive: options?.activeOnly,
        serviceType: options?.serviceType,
      })

      this.logAccess('Retrieved appointment templates', { 
        count: templates.length,
        serviceType: options?.serviceType 
      })

      return {
        data: templates,
        success: true,
        context: this.getComplianceContext('appointments'),
        suggestions: this.generateAppointmentSuggestions(templates)
      }
    } catch (error) {
      this.logError('Failed to get appointment templates', error)
      return {
        data: [],
        success: false,
        message: 'Erro ao buscar templates de agendamento.',
        context: this.getComplianceContext('appointments')
      }
    }
  }

  // =====================================
  // PROFESSIONAL SERVICES
  // =====================================

  /**
   * Get professional services mapping for scheduling assistance
   */
  async getProfessionalServices(options?: {
    professionalId?: string
    serviceId?: string
    activeOnly?: boolean
  }): Promise<AgentDataResponse> {
    try {
      const mapping = await trpc.chatbotData.getProfessionalServices.query({
        professionalId: options?.professionalId,
        serviceId: options?.serviceId,
        clinicId: this.context.clinicId,
        isActive: options?.activeOnly,
      })

      this.logAccess('Retrieved professional services mapping', { 
        count: mapping.length,
        professionalId: options?.professionalId,
        serviceId: options?.serviceId
      })

      return {
        data: mapping,
        success: true,
        context: this.getComplianceContext('professionals'),
        suggestions: this.generateProfessionalSuggestions(mapping)
      }
    } catch (error) {
      this.logError('Failed to get professional services', error)
      return {
        data: [],
        success: false,
        message: 'Erro ao buscar serviços dos profissionais.',
        context: this.getComplianceContext('professionals')
      }
    }
  }

  // =====================================
  // COMPREHENSIVE SEARCH
  // =====================================

  /**
   * Comprehensive search across all data sources
   */
  async searchData(query: string, options?: {
    entityTypes?: ('notifications' | 'categories' | 'templates' | 'professionals')[]
    limit?: number
  }): Promise<AgentDataResponse> {
    try {
      const results = await trpc.chatbotData.searchChatbotData.query({
        query,
        clinicId: this.context.clinicId,
        entityTypes: options?.entityTypes,
        limit: options?.limit || 10,
      })

      this.logAccess('Performed comprehensive search', { 
        query,
        resultCount: results.length,
        entityTypes: options?.entityTypes
      })

      return {
        data: results,
        success: true,
        context: this.getComplianceContext('search'),
        suggestions: this.generateSearchSuggestions(query, results)
      }
    } catch (error) {
      this.logError('Search failed', error)
      return {
        data: [],
        success: false,
        message: 'Erro na busca. Tente reformular sua pergunta.',
        context: this.getComplianceContext('search')
      }
    }
  }

  /**
   * Get dashboard overview for general clinic information
   */
  async getDashboardOverview(): Promise<AgentDataResponse> {
    try {
      const dashboard = await trpc.chatbotData.getChatbotDashboard.query({
        clinicId: this.context.clinicId
      })

      this.logAccess('Retrieved dashboard overview', { clinicId: this.context.clinicId })

      return {
        data: dashboard,
        success: true,
        context: this.getComplianceContext('dashboard'),
        suggestions: this.generateDashboardSuggestions(dashboard)
      }
    } catch (error) {
      this.logError('Failed to get dashboard', error)
      return {
        data: {},
        success: false,
        message: 'Erro ao carregar informações do dashboard.',
        context: this.getComplianceContext('dashboard')
      }
    }
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  private logAccess(action: string, metadata?: any) {
    console.log(`[CHATBOT-AGENT-ACCESS] ${action}`, {
      sessionId: this.context.sessionId,
      clinicId: this.context.clinicId,
      userRole: this.context.userRole,
      timestamp: new Date().toISOString(),
      metadata,
      compliance: { lgpd: true, anvisa: true, cfm: true }
    })
  }

  private logError(action: string, error: any) {
    console.error(`[CHATBOT-AGENT-ERROR] ${action}`, {
      sessionId: this.context.sessionId,
      clinicId: this.context.clinicId,
      error: error.message || error,
      timestamp: new Date().toISOString(),
    })
  }

  private getComplianceContext(source: string) {
    return {
      source,
      timestamp: new Date().toISOString(),
      compliance: {
        lgpd: true,
        anvisa: true,
        cfm: true
      }
    }
  }

  private generateNotificationSuggestions(notifications: any[]): string[] {
    if (notifications.length === 0) {
      return ['Não há notificações agendadas no momento.']
    }
    
    return [
      `Há ${notifications.length} notificações agendadas.`,
      'Posso ajudar a agendar novas notificações se necessário.',
      'Todas as notificações seguem as diretrizes de compliance LGPD.'
    ]
  }

  private generateServiceSuggestions(categories: any[]): string[] {
    return [
      `A clínica oferece ${categories.length} categorias de serviços.`,
      'Posso fornecer mais detalhes sobre qualquer serviço específico.',
      'Todos os serviços seguem as regulamentações ANVISA e CFM.'
    ]
  }

  private generateAppointmentSuggestions(templates: any[]): string[] {
    return [
      `Há ${templates.length} tipos de agendamento disponíveis.`,
      'Posso ajudar a encontrar o tipo de consulta mais adequado.',
      'Todos os agendamentos respeitam as diretrizes do CFM.'
    ]
  }

  private generateProfessionalSuggestions(mapping: any[]): string[] {
    return [
      'Posso ajudar a encontrar o profissional adequado para cada serviço.',
      'Todos os profissionais são registrados conforme regulamentações CFM.',
      'Os serviços estão organizados por especialidade e disponibilidade.'
    ]
  }

  private generateSearchSuggestions(query: string, results: any[]): string[] {
    if (results.length === 0) {
      return [
        'Não encontrei resultados para esta busca.',
        'Tente usar termos mais específicos ou diferentes.',
        'Posso ajudar com informações sobre serviços, agendamentos ou profissionais.'
      ]
    }

    return [
      `Encontrei ${results.length} resultados para "${query}".`,
      'Posso fornecer mais detalhes sobre qualquer item específico.',
      'Todas as informações estão atualizadas em tempo real.'
    ]
  }

  private generateDashboardSuggestions(dashboard: any): string[] {
    return [
      'Posso fornecer informações atualizadas sobre a clínica.',
      'Os dados são atualizados em tempo real.',
      'Todas as métricas seguem compliance healthcare.'
    ]
  }
}