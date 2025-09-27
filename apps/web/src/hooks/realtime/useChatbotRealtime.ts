/**
 * Chatbot Real-time Hooks
 * 
 * Specialized hooks for chatbot agents to access data in real-time
 * Optimized for healthcare context and LGPD/ANVISA/CFM compliance
 */

import { useRealtimeQuery } from './useRealtimeQuery'
import { useRealtimeMutation } from './useRealtimeMutation'
import { trpc } from '../../lib/trpc'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// =====================================
// CHATBOT REAL-TIME NOTIFICATION HOOKS
// =====================================

/**
 * Real-time notifications for chatbot agents
 * Automatically updates when notifications are scheduled, sent, or cancelled
 */
export function useChatbotNotifications(options?: {
  status?: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  type?: 'reminder_24h' | 'reminder_1h' | 'confirmation' | 'followup' | 'cancellation' | 'rescheduled'
  limit?: number
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'notifications', options],
    queryFn: () => trpc.chatbotData.listNotifications.query({
      status: options?.status,
      type: options?.type,
      limit: options?.limit || 50,
    }),
    table: 'scheduled_notifications',
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      // Audit log for healthcare compliance
      console.log('[CHATBOT-AUDIT] Notification update received:', {
        eventType: payload.eventType,
        table: payload.table,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_access: true }
      })
    }
  })
}

/**
 * Schedule notification via chatbot
 */
export function useScheduleNotification() {
  return useRealtimeMutation({
    mutationFn: trpc.chatbotData.scheduleNotification.mutate,
    onSuccess: () => {
      console.log('[CHATBOT-AUDIT] Notification scheduled via chatbot agent')
    }
  })
}

// =====================================
// CHATBOT SERVICE CATEGORIES HOOKS
// =====================================

/**
 * Real-time service categories for chatbot agents
 * Updates automatically when categories are added, modified, or removed
 */
export function useChatbotServiceCategories(clinicId: string, options?: {
  includeStats?: boolean
  isActive?: boolean
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'serviceCategories', clinicId, options],
    queryFn: () => trpc.chatbotData.getServiceCategories.query({
      clinicId,
      includeStats: options?.includeStats,
      isActive: options?.isActive,
    }),
    table: 'service_categories',
    schema: 'public',
    filter: `clinic_id=eq.${clinicId}`,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Service category update received:', {
        eventType: payload.eventType,
        clinicId,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_access: true }
      })
    }
  })
}

// =====================================
// CHATBOT APPOINTMENT TEMPLATES HOOKS
// =====================================

/**
 * Real-time appointment templates for chatbot agents
 * Helps agents suggest appropriate appointment types and durations
 */
export function useChatbotAppointmentTemplates(clinicId: string, options?: {
  isActive?: boolean
  serviceType?: string
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'appointmentTemplates', clinicId, options],
    queryFn: () => trpc.chatbotData.getAppointmentTemplates.query({
      clinicId,
      isActive: options?.isActive,
      serviceType: options?.serviceType,
    }),
    table: 'appointment_templates',
    schema: 'public',
    filter: `clinic_id=eq.${clinicId}`,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Appointment template update received:', {
        eventType: payload.eventType,
        clinicId,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_access: true }
      })
    }
  })
}

// =====================================
// CHATBOT SERVICE TEMPLATES HOOKS
// =====================================

/**
 * Real-time service templates for chatbot agents
 * Enables chatbot to suggest service packages and bundled offerings
 */
export function useChatbotServiceTemplates(clinicId: string, options?: {
  isActive?: boolean
  category?: string
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'serviceTemplates', clinicId, options],
    queryFn: () => trpc.chatbotData.getServiceTemplates.query({
      clinicId,
      isActive: options?.isActive,
      category: options?.category,
    }),
    table: 'service_templates',
    schema: 'public',
    filter: `clinic_id=eq.${clinicId}`,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Service template update received:', {
        eventType: payload.eventType,
        clinicId,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_access: true }
      })
    }
  })
}

// =====================================
// CHATBOT PROFESSIONAL SERVICES HOOKS
// =====================================

/**
 * Real-time professional services mapping for chatbot agents
 * Helps chatbot understand which professionals offer which services
 */
export function useChatbotProfessionalServices(options?: {
  professionalId?: string
  serviceId?: string
  clinicId?: string
  isActive?: boolean
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'professionalServices', options],
    queryFn: () => trpc.chatbotData.getProfessionalServices.query({
      professionalId: options?.professionalId,
      serviceId: options?.serviceId,
      clinicId: options?.clinicId,
      isActive: options?.isActive,
    }),
    table: 'professional_services',
    schema: 'public',
    filter: options?.clinicId ? `clinic_id=eq.${options.clinicId}` : undefined,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Professional service mapping update received:', {
        eventType: payload.eventType,
        clinicId: options?.clinicId,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_access: true }
      })
    }
  })
}

// =====================================
// CHATBOT COMPREHENSIVE SEARCH HOOK
// =====================================

/**
 * Comprehensive real-time search for chatbot agents
 * Searches across all data sources to answer user questions
 */
export function useChatbotDataSearch(searchQuery: string, context?: {
  clinicId?: string
  entityTypes?: ('notifications' | 'categories' | 'templates' | 'professionals')[]
  limit?: number
}) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'search', searchQuery, context],
    queryFn: () => trpc.chatbotData.searchChatbotData.query({
      query: searchQuery,
      clinicId: context?.clinicId,
      entityTypes: context?.entityTypes,
      limit: context?.limit || 20,
    }),
    // Search results can change based on multiple tables
    table: 'scheduled_notifications', // Primary table, but will invalidate on changes to others
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: false, // Disable for search results
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Data change affecting search results:', {
        eventType: payload.eventType,
        table: payload.table,
        searchQuery,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_search: true }
      })
    }
  })
}

// =====================================
// CHATBOT REAL-TIME DASHBOARD HOOK
// =====================================

/**
 * Real-time dashboard data for chatbot agents
 * Provides comprehensive overview for answering dashboard-related questions
 */
export function useChatbotDashboard(clinicId: string) {
  return useRealtimeQuery({
    queryKey: ['chatbot', 'dashboard', clinicId],
    queryFn: () => trpc.chatbotData.getChatbotDashboard.query({ clinicId }),
    table: 'scheduled_notifications', // Will invalidate on any of these changes
    schema: 'public',
    filter: `clinic_id=eq.${clinicId}`,
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: false, // Dashboard data is aggregated
    onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => {
      console.log('[CHATBOT-AUDIT] Dashboard data update received:', {
        eventType: payload.eventType,
        table: payload.table,
        clinicId,
        timestamp: new Date().toISOString(),
        metadata: { chatbot_dashboard: true }
      })
    }
  })
}

// =====================================
// EXPORT ALL HOOKS
// =====================================

export const chatbotRealtimeHooks = {
  // Notifications
  useChatbotNotifications,
  useScheduleNotification,
  
  // Service Categories
  useChatbotServiceCategories,
  
  // Templates
  useChatbotAppointmentTemplates,
  useChatbotServiceTemplates,
  
  // Professional Services
  useChatbotProfessionalServices,
  
  // Search & Dashboard
  useChatbotDataSearch,
  useChatbotDashboard,
}