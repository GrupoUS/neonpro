/**
 * Unified Agent Provider - Connects CopilotKit to Unified Agent Interface
 * Provides seamless integration between frontend CopilotKit and backend orchestration
 */

import { CopilotKit } from '@copilotkit/react-core'
import useCoAgent from '@copilotkit/react-core'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
// Mock types for now - will be replaced with actual API integration
interface UnifiedAgentRequest {
  sessionId: string
  userId: string
  patientId?: string
  query: string
  context: any
  mode: string
  provider: string
}

interface UnifiedAgentResponse {
  response: {
    content: string
    type: string
  }
  success: boolean
  error?: string
}

// Mock unified agent interface
const unifiedAgentInterface = {
  initialize: async () => {},
  getHealthStatus: async () => ({ success: true, data: {} }),
  createConversation: async (sessionId: string, userId: string, patientId?: string, description?: string, options?: any) => ({ success: true }),
  processRequest: async (request: UnifiedAgentRequest) => ({
    success: true,
    data: { response: { content: 'Mock response', type: 'text' }, success: true }
  }),
}

// Types extending CopilotKit with healthcare-specific features
export interface HealthcareAgentConfig {
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

export interface AgentSession {
  id: string
  userId: string
  patientId?: string
  clinicId: string
  mode: 'chat' | 'rag' | 'copilot'
  provider: 'openai' | 'anthropic' | 'google' | 'local'
  status: 'active' | 'idle' | 'error'
  createdAt: Date
  lastActivity: Date
}

interface UnifiedAgentContextType {
  config: HealthcareAgentConfig | null
  currentSession: AgentSession | null
  isProcessing: boolean
  healthStatus: any | null
  
  // Session management
  createSession: (patientId?: string, mode?: AgentSession['mode']) => Promise<string>
  switchMode: (mode: AgentSession['mode']) => Promise<void>
  
  // Communication
  sendMessage: (content: string, options?: {
    mode?: AgentSession['mode']
    provider?: AgentSession['provider']
  }) => Promise<UnifiedAgentResponse | null>
  
  // Actions
  executeAction: (action: string, params: Record<string, any>) => Promise<any>
  
  // Compliance
  exportSession: () => Promise<string>
  clearSession: () => Promise<void>
}

const UnifiedAgentContext = createContext<UnifiedAgentContextType | undefined>(undefined)

interface UnifiedAgentProviderProps {
  children: ReactNode
  config: HealthcareAgentConfig
  runtimeUrl?: string
}

export const UnifiedAgentProvider: React.FC<UnifiedAgentProviderProps> = ({
  children,
  config,
  runtimeUrl = '/api/v2/ai/copilot',
}) => {
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize on mount
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        // Initialize backend unified agent interface
        await unifiedAgentInterface.initialize()
        
        // Get initial health status
        const healthResponse = await unifiedAgentInterface.getHealthStatus()
        if (healthResponse.success) {
          setHealthStatus(healthResponse.data)
        }
        
        setInitialized(true)
      } catch (error) {
        console.error('Failed to initialize UnifiedAgentProvider:', error)
      }
    }

    initializeProvider()
  }, [])

  // Create a new agent session
  const createSession = useCallback(async (
    patientId?: string,
    mode: AgentSession['mode'] = 'chat'
  ): Promise<string> => {
    if (!initialized) {
      throw new Error('Provider not initialized')
    }

    try {
      setIsProcessing(true)
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create session in backend
      const sessionResponse = await unifiedAgentInterface.createConversation(
        sessionId,
        config.userId,
        patientId,
        `Healthcare Session - ${new Date().toLocaleDateString()}`,
        { mode, clinicId: config.clinicId }
      )

      if (!sessionResponse.success) {
        throw new Error('Failed to create session')
      }

      const newSession: AgentSession = {
        id: sessionId,
        userId: config.userId,
        patientId,
        clinicId: config.clinicId,
        mode,
        provider: 'openai', // Default provider
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      setCurrentSession(newSession)
      return sessionId
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [config, initialized])

  // Switch agent mode
  const switchMode = useCallback(async (mode: AgentSession['mode']) => {
    if (!currentSession) return

    try {
      setIsProcessing(true)
      
      const updatedSession: AgentSession = {
        ...currentSession,
        mode,
        lastActivity: new Date(),
      }

      setCurrentSession(updatedSession)
    } catch (error) {
      console.error('Failed to switch mode:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [currentSession])

  // Send message through unified agent interface
  const sendMessage = useCallback(async (
    content: string,
    options: {
      mode?: AgentSession['mode']
      provider?: AgentSession['provider']
    } = {}
  ): Promise<UnifiedAgentResponse | null> => {
    if (!currentSession || !initialized) {
      return null
    }

    try {
      setIsProcessing(true)

      const request: UnifiedAgentRequest = {
        sessionId: currentSession.id,
        userId: currentSession.userId,
        patientId: currentSession.patientId,
        query: content,
        context: {
          clinicId: currentSession.clinicId,
          userRole: config.userRole,
          language: config.language,
          compliance: config.compliance,
        },
        mode: options.mode || currentSession.mode,
        provider: options.provider || currentSession.provider,
      }

      const response = await unifiedAgentInterface.processRequest(request)
      
      if (response.success) {
        // Update session activity
        setCurrentSession(prev => prev ? {
          ...prev,
          lastActivity: new Date(),
        } : null)
        
        return response.data
      } else {
        throw new Error('Failed to process message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [currentSession, config, initialized])

  // Execute CopilotKit action through unified agent
  const executeAction = useCallback(async (
    action: string,
    params: Record<string, any>
  ): Promise<any> => {
    if (!currentSession) {
      throw new Error('No active session')
    }

    try {
      setIsProcessing(true)

      // Convert action to a natural language query for the agent
      const actionQuery = `Execute action: ${action}. Parameters: ${JSON.stringify(params)}`
      
      const response = await sendMessage(actionQuery, {
        mode: 'copilot'
      })

      if (response) {
        try {
          // Try to parse structured response if available
          return JSON.parse(response.response.content)
        } catch {
          // Return natural language response
          return { response: { content: response.response.content, type: 'text' }, success: true } as UnifiedAgentResponse
        }
      }

      throw new Error('No response from agent')
    } catch (error) {
      console.error('Failed to execute action:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [currentSession, sendMessage])

  // Export session data for LGPD compliance
  const exportSession = useCallback(async (): Promise<string> => {
    if (!currentSession) {
      return ''
    }

    try {
      // Format session data for export with LGPD compliance
      const exportData = {
        sessionId: currentSession.id,
        clinicId: currentSession.clinicId,
        exportedAt: new Date().toISOString(),
        exportedBy: config.userId,
        mode: currentSession.mode,
        provider: currentSession.provider,
        compliance: config.compliance,
        // Session data would be fetched from backend in real implementation
        messages: [], // Would be populated from actual conversation history
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export session:', error)
      throw error
    }
  }, [currentSession, config])

  // Clear current session
  const clearSession = useCallback(async () => {
    try {
      setCurrentSession(null)
    } catch (error) {
      console.error('Failed to clear session:', error)
      throw error
    }
  }, [])

  // Auto-create session if none exists and user interacts
  useEffect(() => {
    if (initialized && !currentSession && !isProcessing) {
      // Don't auto-create - let user explicitly start a session
      // This ensures proper consent and session management
    }
  }, [initialized, currentSession, isProcessing])

  const contextValue: UnifiedAgentContextType = {
    config,
    currentSession,
    isProcessing,
    healthStatus,
    createSession,
    switchMode,
    sendMessage,
    executeAction,
    exportSession,
    clearSession,
  }

  return (
    <UnifiedAgentContext.Provider value={contextValue}>
      <CopilotKit 
        runtimeUrl={runtimeUrl}
        agentConfig={{
          // Configure CopilotKit for healthcare use
          chat: {
            instructions: `You are a healthcare assistant for NeonPro. 
            Follow these guidelines:
            - Always maintain patient privacy (LGPD compliant)
            - Provide accurate medical information
            - Be helpful and professional
            - If you don't know something, say so
            - Never provide medical diagnoses without proper context`,
            context: `Healthcare clinic: ${config.clinicId}
            User role: ${config.userRole}
            Language: ${config.language}
            Compliance: LGPD, ANVISA, CFM enabled`,
          },
          actions: {
            // Healthcare-specific actions will be registered here
          },
        }}
      >
        {children}
      </CopilotKit>
    </UnifiedAgentContext.Provider>
  )
}

// Hook to use the unified agent context
export const useUnifiedAgent = () => {
  const context = useContext(UnifiedAgentContext)
  if (!context) {
    throw new Error('useUnifiedAgent must be used within a UnifiedAgentProvider')
  }
  return context
}

// Hook to access CopilotKit co-agent functionality
export const useHealthcareAgent = () => {
  const { currentSession, sendMessage, executeAction } = useUnifiedAgent()
  
  // Get current agent from CopilotKit
  const coAgent = useCoAgent({
    name: 'healthcare-agent',
    instructions: `Healthcare assistant for ${currentSession?.clinicId || 'NeonPro'}`,
  })

  return {
    agent: coAgent,
    sendMessage,
    executeAction,
    isReady: !!currentSession,
  }
}

export default UnifiedAgentProvider