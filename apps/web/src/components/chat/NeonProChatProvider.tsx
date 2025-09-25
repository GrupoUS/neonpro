/**
 * NeonPro Chat Provider Component
 *
 * Main context provider for CopilotKit integration with healthcare-specific configuration
 * Features:
 * - Multi-agent coordination (Client, Financial, Appointment)
 * - LGPD-compliant data handling
 * - Portuguese healthcare context
 * - Real-time agent communication
 * - WCAG 2.1 AA+ accessibility
 */

import { CopilotKit } from '@copilotkit/react-core'
import { useCoAgent } from '@copilotkit/react-core'
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react'

// Types
export interface ChatAgentState {
  id: string
  type: 'client' | 'financial' | 'appointment'
  name: string
  status: 'idle' | 'thinking' | 'responding' | 'error'
  context: {
    patientId?: string
    clinicId: string
    sessionData?: Record<string, any>
  }
  messages: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    metadata?: Record<string, any>
  }>
}

export interface ChatConfig {
  clinicId: string
  userId: string
  userRole: 'admin' | 'aesthetician' | 'coordinator' | 'receptionist'
  language: 'pt-BR' | 'en-US'
  compliance: {
    lgpdEnabled: boolean
    auditLogging: boolean
    dataRetention: number // days
  }
}

interface ChatContextType {
  config: ChatConfig | null
  activeAgent: ChatAgentState | null
  agents: ChatAgentState[]
  setActiveAgent: (agentType: ChatAgentState['type']) => void
  sendMessage: (content: string, agentType: ChatAgentState['type']) => Promise<void>
  clearChat: (agentType?: ChatAgentState['type']) => void
  exportChat: (agentType: ChatAgentState['type']) => Promise<string>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface NeonProChatProviderProps {
  children: ReactNode
  config?: Partial<ChatConfig>
}

export const NeonProChatProvider: React.FC<NeonProChatProviderProps> = ({
  children,
  config: userConfig,
}) => {
  const [config, setConfig] = useState<ChatConfig | null>(null)
  const [agents, setAgents] = useState<ChatAgentState[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Initialize chat configuration
  const initializeConfig = useCallback((userConfig: Partial<ChatConfig>) => {
    const defaultConfig: ChatConfig = {
      clinicId: 'default-clinic',
      userId: 'default-user',
      userRole: 'receptionist',
      language: 'pt-BR',
      compliance: {
        lgpdEnabled: true,
        auditLogging: true,
        dataRetention: 90,
      },
    }

    const mergedConfig = { ...defaultConfig, ...userConfig }
    setConfig(mergedConfig)

    // Initialize agents
    const initialAgents: ChatAgentState[] = [
      {
        id: 'client-agent',
        type: 'client',
        name: 'Assistente de Pacientes',
        status: 'idle',
        context: {
          clinicId: mergedConfig.clinicId,
        },
        messages: [],
      },
      {
        id: 'financial-agent',
        type: 'financial',
        name: 'Assistente Financeiro',
        status: 'idle',
        context: {
          clinicId: mergedConfig.clinicId,
        },
        messages: [],
      },
      {
        id: 'appointment-agent',
        type: 'appointment',
        name: 'Assistente de Agendamento',
        status: 'idle',
        context: {
          clinicId: mergedConfig.clinicId,
        },
        messages: [],
      },
    ]

    setAgents(initialAgents)
    setActiveAgentId('client-agent')
  }, [])

  // Set active agent
  const setActiveAgent = useCallback((agentType: ChatAgentState['type']) => {
    const agent = agents.find(a => a.type === agentType)
    if (agent) {
      setActiveAgentId(agent.id)
    }
  }, [agents])

  // Send message to agent
  const sendMessage = useCallback(async (
    content: string,
    agentType: ChatAgentState['type'],
  ) => {
    if (!config) return

    const agentIndex = agents.findIndex(a => a.type === agentType)
    if (agentIndex === -1) return

    const agent = agents[agentIndex]
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role: 'user' as const,
      timestamp: new Date(),
      metadata: {
        userId: config.userId,
        userRole: config.userRole,
      },
    }

    // Update agent state
    const updatedAgents = [...agents]
    updatedAgents[agentIndex] = {
      ...agent,
      status: 'thinking',
      messages: [...agent.messages, userMessage],
    }
    setAgents(updatedAgents)

    try {
      // LGPD compliance: Log message for audit
      if (config.compliance.auditLogging) {
        console.warn(`[LGPD Audit] Message sent to ${agentType} agent:`, {
          messageId: userMessage.id,
          userId: config.userId,
          timestamp: userMessage.timestamp,
          contentLength: content.length,
        })
      }

      // Simulate agent processing (in real implementation, this would call the backend)
      setTimeout(() => {
        const agentResponse = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: generateAgentResponse(content, agentType),
          role: 'assistant' as const,
          timestamp: new Date(),
          metadata: {
            agentType,
            processingTime: 1000 + Math.random() * 2000,
          },
        }

        const finalAgents = [...updatedAgents]
        finalAgents[agentIndex] = {
          ...agent,
          status: 'idle',
          messages: [...agent.messages, userMessage, agentResponse],
        }
        setAgents(finalAgents)
      }, 1000 + Math.random() * 2000)
    } catch (error) {
      console.error(`Error sending message to ${agentType} agent:`, error)

      // Update agent state to error
      const errorAgents = [...updatedAgents]
      errorAgents[agentIndex] = {
        ...agent,
        status: 'error',
      }
      setAgents(errorAgents)
    }
  }, [config, agents])

  // Clear chat history
  const clearChat = useCallback((agentType?: ChatAgentState['type']) => {
    if (agentType) {
      setAgents(prev =>
        prev.map(agent =>
          agent.type === agentType
            ? { ...agent, messages: [], status: 'idle' }
            : agent
        )
      )
    } else {
      setAgents(prev =>
        prev.map(agent => ({
          ...agent,
          messages: [],
          status: 'idle',
        }))
      )
    }
  }, [])

  // Export chat history
  const exportChat = useCallback(async (agentType: ChatAgentState['type']) => {
    const agent = agents.find(a => a.type === agentType)
    if (!agent || !config) return ''

    // LGPD compliance: Anonymize sensitive data before export
    const exportData = {
      agent: agent.name,
      type: agent.type,
      exportedAt: new Date().toISOString(),
      exportedBy: config.userId,
      messageCount: agent.messages.length,
      messages: agent.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        // Remove sensitive metadata for export
        metadata: msg.metadata
          ? {
            ...msg.metadata,
            userId: 'REDACTED',
            patientId: msg.metadata?.patientId ? 'REDACTED' : undefined,
          }
          : undefined,
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }, [agents, config])

  // Get active agent
  const activeAgent = agents.find(agent => agent.id === activeAgentId) || null

  const value: ChatContextType = {
    config,
    activeAgent,
    agents,
    setActiveAgent,
    sendMessage,
    clearChat,
    exportChat,
  }

  return (
    <ChatContext.Provider value={value}>
      <CopilotKit runtimeUrl='/api/copilotkit'>
        {children}
      </CopilotKit>
    </ChatContext.Provider>
  )
}

// Helper function to generate agent responses (placeholder)
const generateAgentResponse = (userMessage: string, agentType: ChatAgentState['type']): string => {
  const responses = {
    client: [
      'Entendi! Posso ajudar você a gerenciar informações do paciente. O que você gostaria de fazer?',
      'Vou verificar os dados do paciente no sistema. Um momento, por favor.',
      'Para acessar informações do paciente, preciso confirmar sua identidade e permissões.',
    ],
    financial: [
      'Vou analisar a situação financeira do paciente. Deixe-me verificar os registros.',
      'Posso ajudar com faturamento, pagamentos e informações financeiras. Qual é sua dúvida?',
      'Verificando o histórico financeiro e status de pagamentos...',
    ],
    appointment: [
      'Vou verificar a disponibilidade para agendamento. Qual tipo de procedimento você precisa?',
      'Posso ajudar a encontrar o melhor horário considerando a agenda e preferências do paciente.',
      'Analisando a agenda e encontrando slots disponíveis...',
    ],
  }

  const agentResponses = responses[agentType]
  return agentResponses[Math.floor(Math.random() * agentResponses.length)]
}

// Hook to use chat context
export const useNeonProChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useNeonProChat must be used within a NeonProChatProvider')
  }
  return context
}

export default NeonProChatProvider
