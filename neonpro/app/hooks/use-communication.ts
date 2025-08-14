import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import type {
  Message,
  MessageThread,
  MessageTemplate,
  CommunicationStats,
  SendMessageRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  MessageFilters,
  ThreadFilters,
  TemplateFilters,
  PaginatedResponse
} from '@/app/lib/types/communication'

// Query keys for React Query
export const communicationKeys = {
  all: ['communication'] as const,
  
  // Messages
  messages: () => [...communicationKeys.all, 'messages'] as const,
  messagesList: (filters?: MessageFilters) => [...communicationKeys.messages(), 'list', filters] as const,
  message: (id: string) => [...communicationKeys.messages(), 'detail', id] as const,
  messagesByThread: (threadId: string) => [...communicationKeys.messages(), 'thread', threadId] as const,
  
  // Threads
  threads: () => [...communicationKeys.all, 'threads'] as const,
  threadsList: (filters?: ThreadFilters) => [...communicationKeys.threads(), 'list', filters] as const,
  thread: (id: string) => [...communicationKeys.threads(), 'detail', id] as const,
  threadsStats: () => [...communicationKeys.threads(), 'stats'] as const,
  
  // Templates
  templates: () => [...communicationKeys.all, 'templates'] as const,
  templatesList: (filters?: TemplateFilters) => [...communicationKeys.templates(), 'list', filters] as const,
  template: (id: string) => [...communicationKeys.templates(), 'detail', id] as const,
  templatesByCategory: (category: string) => [...communicationKeys.templates(), 'category', category] as const,
  
  // Stats
  stats: () => [...communicationKeys.all, 'stats'] as const,
  statsOverview: () => [...communicationKeys.stats(), 'overview'] as const,
  statsMessages: (period?: string) => [...communicationKeys.stats(), 'messages', period] as const
}

// API functions
const api = {
  // Messages
  async getMessages(filters?: MessageFilters): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    const response = await fetch(`/api/communication/messages?${params}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch messages')
    }
    return response.json()
  },

  async getMessage(id: string): Promise<{ data: { message: Message } }> {
    const response = await fetch(`/api/communication/messages/${id}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch message')
    }
    return response.json()
  },

  async sendMessage(data: SendMessageRequest): Promise<{ data: { message: Message } }> {
    const response = await fetch('/api/communication/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }
    return response.json()
  },

  async markMessageAsRead(id: string): Promise<{ data: { message: Message } }> {
    const response = await fetch(`/api/communication/messages/${id}/read`, {
      method: 'POST'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark message as read')
    }
    return response.json()
  },

  async deleteMessage(id: string): Promise<void> {
    const response = await fetch(`/api/communication/messages/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete message')
    }
  },

  // Threads
  async getThreads(filters?: ThreadFilters): Promise<PaginatedResponse<MessageThread>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    const response = await fetch(`/api/communication/threads?${params}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch threads')
    }
    return response.json()
  },

  async getThread(id: string): Promise<{ data: { thread: MessageThread } }> {
    const response = await fetch(`/api/communication/threads/${id}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch thread')
    }
    return response.json()
  },

  async createThread(data: { 
    patient_id: string; 
    subject?: string; 
    priority?: 'low' | 'normal' | 'high' | 'urgent' 
  }): Promise<{ data: { thread: MessageThread } }> {
    const response = await fetch('/api/communication/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create thread')
    }
    return response.json()
  },

  async updateThread(id: string, data: {
    status?: 'active' | 'closed' | 'archived';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    assigned_to?: string;
  }): Promise<{ data: { thread: MessageThread } }> {
    const response = await fetch(`/api/communication/threads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update thread')
    }
    return response.json()
  },

  async archiveThread(id: string): Promise<{ data: { thread: MessageThread } }> {
    const response = await fetch(`/api/communication/threads/${id}/archive`, {
      method: 'POST'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to archive thread')
    }
    return response.json()
  },

  // Templates
  async getTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<MessageTemplate>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    const response = await fetch(`/api/communication/templates?${params}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch templates')
    }
    return response.json()
  },

  async getTemplate(id: string): Promise<{ data: { template: MessageTemplate } }> {
    const response = await fetch(`/api/communication/templates/${id}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch template')
    }
    return response.json()
  },

  async createTemplate(data: CreateTemplateRequest): Promise<{ data: { template: MessageTemplate } }> {
    const response = await fetch('/api/communication/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create template')
    }
    return response.json()
  },

  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<{ data: { template: MessageTemplate } }> {
    const response = await fetch(`/api/communication/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update template')
    }
    return response.json()
  },

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`/api/communication/templates/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete template')
    }
  },

  async duplicateTemplate(id: string, name: string): Promise<{ data: { template: MessageTemplate } }> {
    const response = await fetch(`/api/communication/templates/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to duplicate template')
    }
    return response.json()
  },

  // Stats
  async getCommunicationStats(): Promise<{ data: CommunicationStats }> {
    const response = await fetch('/api/communication/stats')
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch communication stats')
    }
    return response.json()
  }
}

// Hooks for Messages
export function useMessages(filters?: MessageFilters) {
  return useQuery({
    queryKey: communicationKeys.messagesList(filters),
    queryFn: () => api.getMessages(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })
}

export function useMessage(id: string, enabled = true) {
  return useQuery({
    queryKey: communicationKeys.message(id),
    queryFn: () => api.getMessage(id),
    enabled: enabled && !!id,
    staleTime: 60000 // 1 minute
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.sendMessage,
    onSuccess: (data) => {
      // Invalidate messages list to show new message
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() })
      // Also invalidate threads if this message is part of a thread
      queryClient.invalidateQueries({ queryKey: communicationKeys.threads() })
      toast.success('Message sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
    }
  })
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.markMessageAsRead,
    onSuccess: (data, messageId) => {
      // Update the specific message in cache
      queryClient.setQueryData(
        communicationKeys.message(messageId),
        { data: { message: data.data.message } }
      )
      // Invalidate messages list to update read status
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark message as read')
    }
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteMessage,
    onSuccess: () => {
      // Invalidate messages list
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() })
      toast.success('Message deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete message')
    }
  })
}// Hooks for Threads
export function useThreads(filters?: ThreadFilters) {
  return useQuery({
    queryKey: communicationKeys.threadsList(filters),
    queryFn: () => api.getThreads(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })
}

export function useThread(id: string, enabled = true) {
  return useQuery({
    queryKey: communicationKeys.thread(id),
    queryFn: () => api.getThread(id),
    enabled: enabled && !!id,
    staleTime: 60000 // 1 minute
  })
}

export function useCreateThread() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createThread,
    onSuccess: () => {
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: communicationKeys.threads() })
      toast.success('Thread created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create thread')
    }
  })
}

export function useUpdateThread() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateThread>[1] }) =>
      api.updateThread(id, data),
    onSuccess: (data, { id }) => {
      // Update the specific thread in cache
      queryClient.setQueryData(
        communicationKeys.thread(id),
        { data: { thread: data.data.thread } }
      )
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: communicationKeys.threads() })
      toast.success('Thread updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update thread')
    }
  })
}

export function useArchiveThread() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.archiveThread,
    onSuccess: (data, threadId) => {
      // Update the specific thread in cache
      queryClient.setQueryData(
        communicationKeys.thread(threadId),
        { data: { thread: data.data.thread } }
      )
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: communicationKeys.threads() })
      toast.success('Thread archived successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive thread')
    }
  })
}

// Hooks for Templates
export function useTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: communicationKeys.templatesList(filters),
    queryFn: () => api.getTemplates(filters),
    staleTime: 60000, // 1 minute - templates change less frequently
    refetchOnWindowFocus: false
  })
}

export function useTemplate(id: string, enabled = true) {
  return useQuery({
    queryKey: communicationKeys.template(id),
    queryFn: () => api.getTemplate(id),
    enabled: enabled && !!id,
    staleTime: 300000 // 5 minutes - templates are fairly static
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createTemplate,
    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() })
      toast.success('Template created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template')
    }
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      api.updateTemplate(id, data),
    onSuccess: (data, { id }) => {
      // Update the specific template in cache
      queryClient.setQueryData(
        communicationKeys.template(id),
        { data: { template: data.data.template } }
      )
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() })
      toast.success('Template updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template')
    }
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteTemplate,
    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() })
      toast.success('Template deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template')
    }
  })
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.duplicateTemplate(id, name),
    onSuccess: () => {
      // Invalidate templates list to show new template
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() })
      toast.success('Template duplicated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate template')
    }
  })
}

// Hooks for Statistics
export function useCommunicationStats() {
  return useQuery({
    queryKey: communicationKeys.statsOverview(),
    queryFn: api.getCommunicationStats,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// Specialized hooks for common use cases
export function useInbox(filters?: MessageFilters) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  
  const messagesQuery = useMessages({
    ...filters,
    status: 'delivered', // Only show delivered messages in inbox
    sort: 'created_at',
    order: 'desc'
  })
  
  const markAsRead = useMarkMessageAsRead()
  
  const handleSelectMessage = useCallback((messageId: string) => {
    setSelectedMessage(messageId)
    // Auto-mark as read when selected
    markAsRead.mutate(messageId)
  }, [markAsRead])
  
  return {
    ...messagesQuery,
    selectedMessage,
    setSelectedMessage: handleSelectMessage,
    markAsRead
  }
}

export function usePatientCommunication(patientId: string) {
  const threadsQuery = useThreads({
    patient_id: patientId,
    sort: 'updated_at',
    order: 'desc'
  })
  
  const messagesQuery = useMessages({
    recipient_id: patientId,
    sort: 'created_at',
    order: 'desc'
  })
  
  const createThread = useCreateThread()
  const sendMessage = useSendMessage()
  
  const startConversation = useCallback(async (subject?: string) => {
    return createThread.mutateAsync({
      patient_id: patientId,
      subject,
      priority: 'normal'
    })
  }, [createThread, patientId])
  
  const sendQuickMessage = useCallback(async (content: string, channel: 'sms' | 'email' | 'whatsapp' = 'sms') => {
    return sendMessage.mutateAsync({
      recipient_id: patientId,
      recipient_type: 'patient',
      content,
      channel,
      priority: 'normal'
    })
  }, [sendMessage, patientId])
  
  return {
    threads: threadsQuery,
    messages: messagesQuery,
    startConversation,
    sendQuickMessage,
    isCreatingThread: createThread.isPending,
    isSendingMessage: sendMessage.isPending
  }
}

export function useTemplatesByCategory(category?: string) {
  return useTemplates({
    category,
    active: 'true',
    sort: 'name',
    order: 'asc'
  })
}

// Real-time communication hook
export function useRealtimeCommunication() {
  const queryClient = useQueryClient()
  
  // This would integrate with WebSocket or Supabase real-time subscriptions
  // For now, we'll use polling as a fallback
  const { data: stats } = useCommunicationStats()
  
  const refreshInbox = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: communicationKeys.messages() })
    queryClient.invalidateQueries({ queryKey: communicationKeys.threads() })
  }, [queryClient])
  
  return {
    stats,
    refreshInbox,
    unreadCount: stats?.data?.unread_messages || 0,
    activeThreads: stats?.data?.active_threads || 0
  }
}