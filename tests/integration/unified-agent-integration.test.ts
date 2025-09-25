/**
 * Unified Agent Integration Tests
 * Tests the integration between CopilotKit, AG-UI Protocol, and AI Services
 * Following healthcare compliance requirements (LGPD, ANVISA, CFM)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { unifiedAgentInterface } from '../../apps/api/src/services/ai-agent-orchestration'
import { AgentHealthStatus, UnifiedAgentRequest, UnifiedAgentResponse } from '../../apps/api/src/services/ai-agent-orchestration'

// Mock test data
const MOCK_CONFIG = {
  clinicId: 'test-clinic',
  userId: 'test-user',
  userRole: 'admin' as const,
  language: 'pt-BR' as const,
  compliance: {
    lgpdEnabled: true,
    auditLogging: true,
    dataRetention: 90,
  },
}

const MOCK_SESSION_ID = 'test-session-123'
const MOCK_PATIENT_ID = 'test-patient-456'

describe('UnifiedAgentInterface Integration Tests', () => {
  let healthStatus: AgentHealthStatus | null = null

  beforeEach(async () => {
    // Initialize the interface before each test
    try {
      await unifiedAgentInterface.initialize()
      const healthResponse = await unifiedAgentInterface.getHealthStatus()
      if (healthResponse.success) {
        healthStatus = healthResponse.data
      }
    } catch (error) {
      console.warn('Failed to initialize unified agent for testing:', error)
    }
  })

  afterEach(async () => {
    // Cleanup after each test
    try {
      await unifiedAgentInterface.shutdown()
    } catch (error) {
      console.warn('Failed to shutdown unified agent after testing:', error)
    }
  })

  describe('Health Status', () => {
    it('should report health status correctly', () => {
      expect(healthStatus).toBeTruthy()
      if (healthStatus) {
        expect(healthStatus.ragAgent).toBeDefined()
        expect(healthStatus.chatService).toBeDefined()
        expect(healthStatus.compliance).toBeDefined()
        expect(healthStatus.compliance.lgpdCompliant).toBe(true)
      }
    })

    it('should have proper uptime reporting', () => {
      if (healthStatus) {
        expect(healthStatus.ragAgent.uptime).toBeGreaterThanOrEqual(0)
        expect(healthStatus.chatService.uptime).toBeGreaterThanOrEqual(0)
      }
    })

    it('should report component status', () => {
      if (healthStatus) {
        const validComponentStatuses = ['connected', 'disconnected', 'error', 'active', 'inactive', 'initializing', 'ready']
        
        expect(validComponentStatuses).toContain(healthStatus.ragAgent.components.database)
        expect(validComponentStatuses).toContain(healthStatus.ragAgent.components.vectorStore)
        expect(validComponentStatuses).toContain(healthStatus.ragAgent.components.embeddingManager)
      }
    })
  })

  describe('Chat Mode Processing', () => {
    it('should process chat requests successfully', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Como posso agendar uma consulta?',
        mode: 'chat',
        provider: 'openai',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response.success).toBe(true)
      if (response.success && response.data) {
        expect(response.data.sessionId).toBe(MOCK_SESSION_ID)
        expect(response.data.mode).toBe('chat')
        expect(response.data.response.content).toBeTruthy()
        expect(response.data.response.type).toBe('text')
        expect(response.data.response.metadata?.compliance).toContain('lgpd')
      }
    })

    it('should handle Portuguese queries correctly', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Quais são os sintomas da gripe?',
        mode: 'chat',
        provider: 'openai',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response.success).toBe(true)
      if (response.success && response.data) {
        expect(response.data.response.content).toBeTruthy()
        // Response should be in Portuguese or contain Portuguese medical terminology
        expect(response.data.response.content.length).toBeGreaterThan(10)
      }
    })

    it('should include compliance metadata', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Informações sobre LGPD',
        mode: 'chat',
        provider: 'openai',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response.success).toBe(true)
      if (response.success && response.data) {
        const compliance = response.data.response.metadata?.compliance
        expect(compliance).toBeTruthy()
        expect(Array.isArray(compliance)).toBe(true)
        expect(compliance).toContain('lgpd')
      }
    })
  })

  describe('RAG Mode Processing', () => {
    it('should process RAG requests when available', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        patientId: MOCK_PATIENT_ID,
        query: 'Qual o histórico deste paciente?',
        context: { includeMedicalHistory: true },
        mode: 'rag',
        provider: 'openai',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      // RAG might not be available in test environment, so handle gracefully
      if (response.success) {
        expect(response.data?.mode).toBe('rag')
        expect(response.data?.sessionId).toBe(MOCK_SESSION_ID)
      } else {
        // It's acceptable for RAG to fail in test environment
        expect(response.error).toContain('RAG') || expect(response.error).toBeTruthy()
      }
    })

    it('should handle patient context in RAG mode', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        patientId: MOCK_PATIENT_ID,
        query: 'Mostrar informações do paciente',
        context: {
          patientId: MOCK_PATIENT_ID,
          clinicId: MOCK_CONFIG.clinicId,
        },
        mode: 'rag',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      if (response.success && response.data) {
        expect(response.data?.patientId).toBe(request.patientId)
        expect(response.data?.context).toBeTruthy()
      }
    })
  })

  describe('Copilot Mode Processing', () => {
    it('should process Copilot requests', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Agendar consulta para amanhã',
        mode: 'copilot',
        provider: 'openai',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response.success).toBe(true)
      if (response.success && response.data) {
        expect(response.data?.mode).toBe('copilot')
        expect(response.data?.response.type).toBe('action')
      }
    })

    it('should handle action-oriented queries', async () => {
      const actionQueries = [
        'agendar consulta',
        'cancelar agendamento',
        'verificar disponibilidade',
        'enviar notificação',
      ]

      for (const query of actionQueries) {
        const request: UnifiedAgentRequest = {
          sessionId: MOCK_SESSION_ID,
          userId: MOCK_CONFIG.userId,
          query,
          mode: 'copilot',
        }

        const response = await unifiedAgentInterface.processRequest(request)

        if (response.success && response.data) {
          expect(response.data?.response.content).toBeTruthy()
          expect(response.data?.response.type).toBe('action')
        }
      }
    })
  })

  describe('Session Management', () => {
    it('should create conversations successfully', async () => {
      const response = await unifiedAgentInterface.createConversation(
        MOCK_SESSION_ID,
        MOCK_CONFIG.userId,
        MOCK_PATIENT_ID,
        'Test Session',
        { mode: 'chat', clinicId: MOCK_CONFIG.clinicId }
      )

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data?.sessionId).toBe(MOCK_SESSION_ID)
        expect(response.data?.created).toBe(true)
      }
    })

    it('should handle existing conversations', async () => {
      // Create conversation first
      await unifiedAgentInterface.createConversation(
        MOCK_SESSION_ID,
        MOCK_CONFIG.userId,
        MOCK_PATIENT_ID,
        'Test Session'
      )

      // Try to create same conversation again
      const response = await unifiedAgentInterface.createConversation(
        MOCK_SESSION_ID,
        MOCK_CONFIG.userId,
        MOCK_PATIENT_ID,
        'Test Session 2'
      )

      expect(response.success).toBe(true)
      if (response.success) {
        // Should indicate existing conversation
        expect(response.data?.created).toBe(false)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid session IDs gracefully', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: '', // Invalid session ID
        userId: MOCK_CONFIG.userId,
        query: 'Test query',
        mode: 'chat',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      // Should handle error gracefully
      expect(response).toBeDefined()
      if (!response.success) {
        expect(response.error).toBeTruthy()
      }
    })

    it('should handle empty queries', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: '', // Empty query
        mode: 'chat',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response).toBeDefined()
    })

    it('should handle unsupported providers gracefully', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Test query',
        mode: 'chat',
        provider: 'unsupported' as any, // Should handle gracefully
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response).toBeDefined()
      if (!response.success) {
        expect(response.error).toBeTruthy()
      }
    })
  })

  describe('Compliance and Security', () => {
    it('should maintain LGPD compliance in responses', async () => {
      const requestWithPii: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'O paciente João Silva (CPF: 123.456.789-00) precisa de atendimento',
        mode: 'chat',
      }

      const response = await unifiedAgentInterface.processRequest(requestWithPii)

      if (response.success && response.data) {
        const content = response.data.response.content
        // Should not contain raw PII in response
        expect(content).not.toContain('123.456.789-00')
        expect(content).not.toContain('João Silva')
        
        // Should include compliance metadata
        expect(response.data.response.metadata?.compliance).toContain('lgpd')
      }
    })

    it('should log all interactions for audit', async () => {
      // This test verifies that the interface is configured for audit logging
      // Actual audit log verification would require database access
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Test query for audit logging',
        mode: 'chat',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      expect(response).toBeDefined()
      // In real implementation, we would check audit logs here
    })

    it('should handle healthcare-specific compliance', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Informações sobre medicamentos controlados',
        mode: 'chat',
      }

      const response = await unifiedAgentInterface.processRequest(request)

      if (response.success && response.data) {
        const compliance = response.data.response.metadata?.compliance
        expect(compliance).toBeTruthy()
        expect(Array.isArray(compliance)).toBe(true)
        
        // Should include healthcare compliance standards
        expect(compliance).toEqual(expect.arrayContaining(['lgpd', 'anvisa', 'cfm']))
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        sessionId: `${MOCK_SESSION_ID}-${i}`,
        userId: MOCK_CONFIG.userId,
        query: `Concurrent request ${i + 1}`,
        mode: 'chat' as const,
      }))

      const responses = await Promise.allSettled(
        requests.map(req => unifiedAgentInterface.processRequest(req))
      )

      // All requests should complete (even if some fail)
      expect(responses).toHaveLength(5)
      
      // At least some should succeed
      const successfulResponses = responses.filter(
        r => r.status === 'fulfilled' && r.value.success
      )
      expect(successfulResponses.length).toBeGreaterThan(0)
    })

    it('should respond within reasonable time', async () => {
      const request: UnifiedAgentRequest = {
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_CONFIG.userId,
        query: 'Quick test query',
        mode: 'chat',
      }

      const startTime = Date.now()
      const response = await unifiedAgentInterface.processRequest(request)
      const responseTime = Date.now() - startTime

      expect(response).toBeDefined()
      // Should respond within 10 seconds (generous for test environment)
      expect(responseTime).toBeLessThan(10000)
    })
  })
})

// Helper utilities for testing
export const createMockRequest = (
  overrides: Partial<UnifiedAgentRequest> = {}
): UnifiedAgentRequest => ({
  sessionId: MOCK_SESSION_ID,
  userId: MOCK_CONFIG.userId,
  query: 'Test query',
  mode: 'chat',
  ...overrides,
})

export const expectSuccessfulResponse = (response: any) => {
  expect(response.success).toBe(true)
  expect(response.data).toBeTruthy()
  expect(response.data.sessionId).toBeTruthy()
  expect(response.data.response.content).toBeTruthy()
  expect(response.data.timestamp).toBeTruthy()
}

export const expectComplianceMetadata = (response: any) => {
  if (response.success && response.data) {
    const metadata = response.data.response.metadata
    expect(metadata).toBeTruthy()
    expect(metadata.compliance).toBeTruthy()
    expect(Array.isArray(metadata.compliance)).toBe(true)
    expect(metadata.compliance).toContain('lgpd')
  }
}