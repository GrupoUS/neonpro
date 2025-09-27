/**
 * Chatbot Agent Implementation Example
 * 
 * Practical example showing how chatbot agents should use the data access layer
 * for real-time healthcare data access with full compliance
 */

import React, { useEffect, useState } from 'react'
import { useAdvancedChatbot, useBasicChatbot } from '../hooks/useChatbotIntegration'
import type { ChatbotAgentContext } from '../services/chatbot-agent-data'

// =====================================
// EXAMPLE 1: BASIC CHATBOT USAGE
// =====================================

interface BasicChatbotExampleProps {
  clinicId: string
  sessionId: string
}

export function BasicChatbotExample({ clinicId, sessionId }: BasicChatbotExampleProps) {
  const {
    data,
    agent,
    actions,
    isConnected,
    isLoading,
    error
  } = useBasicChatbot(clinicId, sessionId)

  const [userMessage, setUserMessage] = useState('')
  const [chatResponse, setChatResponse] = useState('')

  // Example: Handle user asking about notifications
  const handleNotificationQuestion = async () => {
    try {
      const result = await agent.getUpcomingNotifications({ hours: 24 })
      
      if (result.success && result.data.length > 0) {
        setChatResponse(
          `Você tem ${result.data.length} notificações agendadas para as próximas 24 horas. ` +
          `${result.suggestions?.join(' ')}`
        )
      } else {
        setChatResponse('Não há notificações agendadas para as próximas 24 horas.')
      }
    } catch (error) {
      setChatResponse('Desculpe, não consegui verificar suas notificações no momento.')
    }
  }

  // Example: Handle user asking about services
  const handleServicesQuestion = async () => {
    try {
      const result = await agent.getServiceCategories({ includeStats: true })
      
      if (result.success) {
        const categoriesText = result.data
          .map((cat: any) => `${cat.name} (${cat.serviceCount || 0} serviços)`)
          .join(', ')
        
        setChatResponse(
          `Nossa clínica oferece as seguintes categorias de serviços: ${categoriesText}. ` +
          `Posso ajudar com informações específicas sobre qualquer serviço.`
        )
      }
    } catch (error) {
      setChatResponse('Desculpe, não consegui carregar as informações dos serviços.')
    }
  }

  // Example: Handle scheduling inquiry
  const handleSchedulingQuestion = async () => {
    try {
      const templates = await agent.getAppointmentTemplates({ activeOnly: true })
      
      if (templates.success && templates.data.length > 0) {
        const typesText = templates.data
          .map((template: any) => `${template.name} (${template.duration} min)`)
          .join(', ')
        
        setChatResponse(
          `Temos os seguintes tipos de consulta disponíveis: ${typesText}. ` +
          `Qual tipo de consulta você gostaria de agendar?`
        )
      }
    } catch (error) {
      setChatResponse('Desculpe, não consegui carregar os tipos de agendamento.')
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">NeonPro Chatbot</h3>
      
      {/* Connection Status */}
      <div className={`mb-4 p-2 rounded text-sm ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '🟢 Conectado em tempo real' : '🔴 Desconectado'}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-sm">
          ⏳ Carregando dados...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">
          ❌ Erro: {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleNotificationQuestion}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ver minhas notificações
        </button>
        
        <button
          onClick={handleServicesQuestion}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Quais serviços vocês oferecem?
        </button>
        
        <button
          onClick={handleSchedulingQuestion}
          className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Quero agendar uma consulta
        </button>
      </div>

      {/* Response Area */}
      {chatResponse && (
        <div className="p-3 bg-gray-50 rounded border">
          <p className="text-sm">{chatResponse}</p>
        </div>
      )}

      {/* Real-time Data Summary */}
      <div className="mt-4 text-xs text-gray-500">
        <p>📊 Dados em tempo real:</p>
        <ul className="list-disc list-inside">
          <li>{data.notifications.length} notificações</li>
          <li>{data.serviceCategories.length} categorias de serviços</li>
          <li>{data.appointmentTemplates.length} tipos de agendamento</li>
        </ul>
      </div>
    </div>
  )
}

// =====================================
// EXAMPLE 2: ADVANCED CHATBOT WITH FULL CONTEXT
// =====================================

interface AdvancedChatbotExampleProps {
  context: ChatbotAgentContext
}

export function AdvancedChatbotExample({ context }: AdvancedChatbotExampleProps) {
  const {
    data,
    agent,
    actions,
    isConnected,
    queries
  } = useAdvancedChatbot(context, {
    enableRealtime: true,
    autoRefresh: true,
    refreshInterval: 15000 // Refresh every 15 seconds
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [conversationHistory, setConversationHistory] = useState<string[]>([])

  // Advanced search with context awareness
  const handleAdvancedSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const result = await actions.searchData(searchQuery, {
        entityTypes: ['notifications', 'categories', 'templates', 'professionals'],
        limit: 10
      })

      if (result.success) {
        setSearchResults(result.data)
        
        // Add to conversation history
        const response = result.suggestions?.join(' ') || 
          `Encontrei ${result.data.length} resultados para "${searchQuery}"`
        
        setConversationHistory(prev => [
          ...prev,
          `Usuário: ${searchQuery}`,
          `NeonPro: ${response}`
        ])
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  // Schedule notification with context
  const handleScheduleReminder = async () => {
    try {
      const result = await actions.scheduleNotification({
        type: 'reminder_24h',
        title: 'Lembrete de Consulta',
        message: 'Sua consulta está agendada para amanhã. Lembre-se de chegar 15 minutos antes.',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        metadata: {
          conversationId: context.sessionId,
          userRole: context.userRole,
          intent: context.conversationContext?.intent
        }
      })

      if (result.success) {
        setConversationHistory(prev => [
          ...prev,
          'NeonPro: ✅ Lembrete agendado com sucesso!'
        ])
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error)
    }
  }

  // Get contextual help based on user role and intent
  const getContextualSuggestions = () => {
    const suggestions = actions.getContextualHelp(context.conversationContext?.intent)
    
    if (context.userRole === 'professional') {
      suggestions.push('Como profissional, você pode ver todos os agendamentos e notificações.')
    } else if (context.userRole === 'admin') {
      suggestions.push('Como administrador, você tem acesso completo aos dados da clínica.')
    }

    return suggestions
  }

  // Real-time data monitoring
  useEffect(() => {
    if (queries?.notifications.data) {
      console.log('[CHATBOT] New notifications received:', queries.notifications.data.length)
    }
  }, [queries?.notifications.data])

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-6">NeonPro Advanced Chatbot Agent</h3>
      
      {/* Context Information */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Context Atual:</h4>
        <div className="text-sm space-y-1">
          <p><strong>Clínica:</strong> {context.clinicId}</p>
          <p><strong>Usuário:</strong> {context.userRole}</p>
          <p><strong>Intent:</strong> {context.conversationContext?.intent || 'Geral'}</p>
          <p><strong>Conexão:</strong> {isConnected ? '🟢 Ativo' : '🔴 Inativo'}</p>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar em todos os dados..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleAdvancedSearch()}
          />
          <button
            onClick={handleAdvancedSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Resultados da Busca:</h4>
          <ul className="text-sm space-y-1">
            {searchResults.map((result, index) => (
              <li key={index} className="p-2 bg-white rounded border">
                {JSON.stringify(result, null, 2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 space-y-2">
        <button
          onClick={handleScheduleReminder}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Agendar Lembrete (24h)
        </button>
        
        <button
          onClick={() => actions.refreshData()}
          className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Atualizar Dados
        </button>
      </div>

      {/* Contextual Suggestions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h4 className="font-medium mb-2">Sugestões Contextuais:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          {getContextualSuggestions().map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Histórico da Conversa:</h4>
          <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
            {conversationHistory.map((message, index) => (
              <p key={index} className={
                message.startsWith('Usuário:') ? 'text-blue-600' : 'text-green-600'
              }>
                {message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Data Overview */}
      <div className="mt-6 p-4 bg-green-50 rounded">
        <h4 className="font-medium mb-2">📊 Dados em Tempo Real:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Notificações:</strong> {data.notifications.length}</p>
            <p><strong>Categorias:</strong> {data.serviceCategories.length}</p>
          </div>
          <div>
            <p><strong>Templates:</strong> {data.appointmentTemplates.length}</p>
            <p><strong>Serviços Pro:</strong> {data.professionalServices.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================
// EXAMPLE 3: NOTIFICATION AGENT
// =====================================

export function NotificationAgentExample({ clinicId }: { clinicId: string }) {
  const { data, actions } = useBasicChatbot(clinicId, `notification-agent-${Date.now()}`)

  const scheduleAppointmentReminder = async (
    appointmentId: string,
    patientEmail: string,
    appointmentDate: Date
  ) => {
    // Schedule 24h reminder
    await actions.scheduleNotification({
      type: 'reminder_24h',
      recipientEmail: patientEmail,
      title: 'Lembrete de Consulta - 24 horas',
      message: `Sua consulta está agendada para ${appointmentDate.toLocaleDateString()} às ${appointmentDate.toLocaleTimeString()}.`,
      scheduledFor: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
      metadata: { appointmentId, type: 'appointment_reminder' }
    })

    // Schedule 1h reminder
    await actions.scheduleNotification({
      type: 'reminder_1h',
      recipientEmail: patientEmail,
      title: 'Lembrete de Consulta - 1 hora',
      message: `Sua consulta é em 1 hora. Lembre-se de chegar 15 minutos antes.`,
      scheduledFor: new Date(appointmentDate.getTime() - 60 * 60 * 1000),
      metadata: { appointmentId, type: 'appointment_reminder' }
    })
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Agent de Notificações</h3>
      <p className="text-sm text-gray-600">
        Este agent automaticamente agenda lembretes para consultas usando a infraestrutura de tempo real.
      </p>
    </div>
  )
}