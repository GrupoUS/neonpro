/**
 * Unified Agent Provider - Connects CopilotKit to Unified Agent Interface
 * Provides seamless integration between frontend CopilotKit and backend orchestration
 */

import { CopilotKit, useCoAgent } from '@copilotkit/react-core'
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
  success: boolean
  response: string
  suggestions?: string[]
  confidence: number
  metadata?: {
    model: string
    tokens: number
    processingTime: number
  }
}

interface UnifiedAgentContextType {
  isProcessing: boolean
  lastResponse: UnifiedAgentResponse | null
  error: string | null
  sendRequest: (request: UnifiedAgentRequest) => Promise<void>
  clearError: () => void
}

const UnifiedAgentContext = createContext<UnifiedAgentContextType | undefined>(undefined)

interface UnifiedAgentProviderProps {
  children: ReactNode
  runtimeUrl?: string
}

export function UnifiedAgentProvider({ children, runtimeUrl }: UnifiedAgentProviderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResponse, setLastResponse] = useState<UnifiedAgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const sendRequest = useCallback(async (request: UnifiedAgentRequest) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Mock implementation - will integrate with actual backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResponse: UnifiedAgentResponse = {
        success: true,
        response: `Processed request for ${request.mode} mode`,
        suggestions: ['Option 1', 'Option 2', 'Option 3'],
        confidence: 0.85,
        metadata: {
          model: 'neonpro-agent-v1',
          tokens: 150,
          processingTime: 850
        }
      }
      
      setLastResponse(mockResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const contextValue: UnifiedAgentContextType = {
    isProcessing,
    lastResponse,
    error,
    sendRequest,
    clearError
  }

  return (
    <UnifiedAgentContext.Provider value={contextValue}>
      <CopilotKit runtimeUrl={runtimeUrl || 'http://localhost:4000'}>
        {children}
      </CopilotKit>
    </UnifiedAgentContext.Provider>
  )
}

export function useUnifiedAgent() {
  const context = useContext(UnifiedAgentContext)
  if (!context) {
    throw new Error('useUnifiedAgent must be used within a UnifiedAgentProvider')
  }
  return context
}

export default UnifiedAgentProvider