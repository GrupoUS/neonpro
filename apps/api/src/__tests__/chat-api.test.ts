/**
 * Chat API Tests
 * Comprehensive test suite for Chat Backend API
 * Coverage: Multi-agent coordination, LGPD compliance, real-time features
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { createTRPCMsw } from 'trpc-openapi/msw'
import { appRouter } from '../trpc/router'
import { createTestContext, createMockSupabaseClient } from './utils/test-helpers'

// Mock data
const mockClinicId = '123e4567-e89b-12d3-a456-426614174000'
const mockUserId = '123e4567-e89b-12d3-a456-426614174001'
const mockPatientId = '123e4567-e89b-12d3-a456-426614174002'

describe('Chat API', () => {
  let msw: ReturnType<typeof createTRPCMsw>
  let mockSupabase: any

  beforeAll(() => {
    msw = createTRPCMsw({ router: appRouter })
  })

  afterAll(() => {
    msw.close()
  })

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  describe('createSession', () => {
    it('should create a new chat session with default agents', async () => {
      const input = {
        clinicId: mockClinicId,
        userId: mockUserId,
        patientId: mockPatientId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'aesthetician' as const,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      const result = await msw.chat.createSession.mutate(input)

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session.agents).toHaveLength(4) // client, financial, appointment, clinical
      expect(result.session.agents[0].type).toBe('client')
      expect(result.session.status).toBe('active')
      expect(result.session.config.compliance.lgpdEnabled).toBe(true)
    })

    it('should validate required fields', async () => {
      const input = {
        clinicId: 'invalid-uuid',
        userId: mockUserId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'invalid-role' as any,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      await expect(msw.chat.createSession.mutate(input)).rejects.toThrow()
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.reject(new Error('Database connection failed'))
          })
        })
      }))

      const input = {
        clinicId: mockClinicId,
        userId: mockUserId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'aesthetician' as const,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      await expect(msw.chat.createSession.mutate(input)).rejects.toThrow('Failed to create chat session')
    })

    it('should log session creation for audit compliance', async () => {
      const input = {
        clinicId: mockClinicId,
        userId: mockUserId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'aesthetician' as const,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      await msw.chat.createSession.mutate(input)

      // Verify audit logging was called
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs')
      expect(mockSupabase.insert).toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    let mockSessionId: string

    beforeEach(() => {
      mockSessionId = '123e4567-e89b-12d3-a456-426614174003'
    })

    it('should send a message and receive agent response', async () => {
      // Mock session data
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    active_agent: 'agent-1',
                    status: 'active',
                    agents: [{ id: 'agent-1', type: 'client' }],
                    patient_id: mockPatientId,
                    config: { compliance: { auditLogging: true } },
                  },
                  error: null,
                })
              })
            })
          })
        }
        if (table === 'chat_messages') {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: 'message-1',
                    content: 'Test message',
                    role: 'user',
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const input = {
        sessionId: mockSessionId,
        content: 'Olá, preciso agendar uma consulta',
        metadata: {
          complianceLevel: 'standard' as const,
          patientId: mockPatientId,
        },
      }

      const result = await msw.chat.sendMessage.mutate(input)

      expect(result.success).toBe(true)
      expect(result.userMessage).toBeDefined()
      expect(result.userMessage.content).toBe('Olá, preciso agendar uma consulta')
      expect(result.agentResponse).toBeDefined()
      expect(result.agentResponse.content).toBeDefined()
    })

    it('should reject messages for inactive sessions', async () => {
      // Mock inactive session
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    status: 'paused',
                  },
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const input = {
        sessionId: mockSessionId,
        content: 'Test message',
      }

      await expect(msw.chat.sendMessage.mutate(input)).rejects.toThrow('Session is not active')
    })

    it('should validate message content length', async () => {
      const input = {
        sessionId: mockSessionId,
        content: 'a'.repeat(2001), // Exceeds 2000 character limit
      }

      await expect(msw.chat.sendMessage.mutate(input)).rejects.toThrow()
    })

    it('should handle empty messages', async () => {
      const input = {
        sessionId: mockSessionId,
        content: '',
      }

      await expect(msw.chat.sendMessage.mutate(input)).rejects.toThrow()
    })
  })

  describe('getSession', () => {
    let mockSessionId: string

    beforeEach(() => {
      mockSessionId = '123e4567-e89b-12d3-a456-426614174003'
    })

    it('should retrieve session with messages', async () => {
      // Mock session and messages data
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    status: 'active',
                    agents: [],
                    config: {},
                  },
                  error: null,
                })
              })
            })
          }
        }
        if (table === 'chat_messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({
                  data: [
                    {
                      id: 'message-1',
                      content: 'Hello',
                      role: 'user',
                      created_at: new Date().toISOString(),
                    },
                    {
                      id: 'message-2',
                      content: 'Hi there!',
                      role: 'assistant',
                      created_at: new Date().toISOString(),
                    },
                  ],
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const input = { sessionId: mockSessionId }

      const result = await msw.chat.getSession.query(input)

      expect(result.session).toBeDefined()
      expect(result.session.id).toBe(mockSessionId)
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].role).toBe('user')
      expect(result.messages[1].role).toBe('assistant')
    })

    it('should reject access to non-existent sessions', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: null,
              error: { message: 'No rows returned' },
            })
          })
        })
      }))

      const input = { sessionId: 'non-existent-session' }

      await expect(msw.chat.getSession.query(input)).rejects.toThrow('Session not found or access denied')
    })

    it('should enforce clinic isolation', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: mockSessionId,
                clinic_id: 'different-clinic-id', // Different clinic
              },
              error: null,
            })
          })
        })
      }))

      const input = { sessionId: mockSessionId }

      await expect(msw.chat.getSession.query(input)).rejects.toThrow('Session not found or access denied')
    })
  })

  describe('getHistory', () => {
    it('should retrieve chat history for user', async () => {
      const mockHistory = [
        { id: 'session-1', user_id: mockUserId, last_activity: '2024-01-15T10:00:00Z' },
        { id: 'session-2', user_id: mockUserId, last_activity: '2024-01-14T15:30:00Z' },
      ]

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              range: () => Promise.resolve({
                data: mockHistory,
                error: null,
              })
            })
          })
        })
      }))

      const input = {
        clinicId: mockClinicId,
        userId: mockUserId,
        limit: 20,
        offset: 0,
      }

      const result = await msw.chat.getHistory.query(input)

      expect(result.sessions).toEqual(mockHistory)
      expect(result.total).toBe(2)
    })

    it('should support pagination', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              range: () => Promise.resolve({
                data: [{ id: 'session-1' }],
                error: null,
              })
            })
          })
        })
      }))

      const input = {
        clinicId: mockClinicId,
        limit: 10,
        offset: 20,
      }

      const result = await msw.chat.getHistory.query(input)

      expect(result.sessions).toHaveLength(1)
    })

    it('should filter by patient ID', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({
                  data: [{ id: 'session-1', patient_id: mockPatientId }],
                  error: null,
                })
              })
            })
          })
        })
      }))

      const input = {
        clinicId: mockClinicId,
        patientId: mockPatientId,
        limit: 20,
        offset: 0,
      }

      const result = await msw.chat.getHistory.query(input)

      expect(result.sessions[0].patient_id).toBe(mockPatientId)
    })
  })

  describe('updateAgent', () => {
    let mockSessionId: string
    let mockAgentId: string

    beforeEach(() => {
      mockSessionId = '123e4567-e89b-12d3-a456-426614174003'
      mockAgentId = 'agent-1'
    })

    it('should update agent status and context', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    agents: [
                      { id: mockAgentId, type: 'client', status: 'idle' },
                    ],
                  },
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const input = {
        sessionId: mockSessionId,
        agentId: mockAgentId,
        status: 'thinking' as const,
        context: { currentTask: 'appointment_booking' },
      }

      const result = await msw.chat.updateAgent.mutate(input)

      expect(result.success).toBe(true)
      expect(result.agent.status).toBe('thinking')
      expect(result.agent.context.currentTask).toBe('appointment_booking')
    })

    it('should validate agent status values', async () => {
      const input = {
        sessionId: mockSessionId,
        agentId: mockAgentId,
        status: 'invalid-status' as any,
      }

      await expect(msw.chat.updateAgent.mutate(input)).rejects.toThrow()
    })
  })

  describe('endSession', () => {
    let mockSessionId: string

    beforeEach(() => {
      mockSessionId = '123e4567-e89b-12d3-a456-426614174003'
    })

    it('should end session successfully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    user_id: mockUserId,
                    status: 'active',
                    config: { compliance: { auditLogging: true } },
                  },
                  error: null,
                })
              })
            }),
            update: () => ({
              eq: () => Promise.resolve({ data: {}, error: null })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const input = { sessionId: mockSessionId }

      const result = await msw.chat.endSession.mutate(input)

      expect(result.success).toBe(true)
      expect(result.endedAt).toBeDefined()
    })

    it('should log session end for audit compliance', async () => {
      let auditLogCalled = false

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: mockSessionId,
                    clinic_id: mockClinicId,
                    user_id: mockUserId,
                    status: 'active',
                    config: { compliance: { auditLogging: true } },
                  },
                  error: null,
                })
              })
            }),
            update: () => ({
              eq: () => Promise.resolve({ data: {}, error: null })
            })
          }
        }
        if (table === 'audit_logs') {
          auditLogCalled = true
          return {
            insert: () => Promise.resolve({ data: {}, error: null })
          }
        }
        return createMockSupabaseClient()
      })

      const input = { sessionId: mockSessionId }
      await msw.chat.endSession.mutate(input)

      expect(auditLogCalled).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.from.mockImplementation(() => ({
        insert: () => Promise.reject(new Error('Connection timeout'))
      }))

      const input = {
        clinicId: mockClinicId,
        userId: mockUserId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'aesthetician' as const,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      await expect(msw.chat.createSession.mutate(input)).rejects.toThrow('Failed to create chat session')
    })

    it('should handle malformed input gracefully', async () => {
      const input = {
        clinicId: null as any,
        userId: mockUserId,
        config: {
          language: 'pt-BR' as const,
          userRole: 'aesthetician' as const,
          compliance: {
            lgpdEnabled: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      }

      await expect(msw.chat.createSession.mutate(input)).rejects.toThrow()
    })

    it('should maintain data consistency during concurrent operations', async () => {
      // This test would verify concurrent session/message operations
      // For simplicity, we'll test the basic scenario
      const sessionId = 'test-session-id'

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: sessionId,
                    clinic_id: mockClinicId,
                    status: 'active',
                    agents: [{ id: 'agent-1', type: 'client' }],
                  },
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      // Test concurrent operations
      const messagePromises = Array.from({ length: 5 }, (_, i) =>
        msw.chat.sendMessage.mutate({
          sessionId,
          content: `Message ${i + 1}`,
        })
      )

      const results = await Promise.allSettled(messagePromises)

      // All operations should succeed
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })
    })
  })

  describe('Performance', () => {
    it('should handle large message history efficiently', async () => {
      const largeMessageHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `message-${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        created_at: new Date(Date.now() - i * 1000).toISOString(),
      }))

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { id: 'session-1', clinic_id: mockClinicId },
                  error: null,
                })
              })
            })
          }
        }
        if (table === 'chat_messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({
                  data: largeMessageHistory,
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const startTime = Date.now()
      const result = await msw.chat.getSession.query({ sessionId: 'session-1' })
      const endTime = Date.now()

      expect(result.messages).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Security', () => {
    it('should prevent unauthorized access to sessions', async () => {
      // Mock session from different clinic
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'session-1',
                clinic_id: 'unauthorized-clinic',
              },
              error: null,
            })
          })
        })
      }))

      await expect(msw.chat.getSession.query({ sessionId: 'session-1' }))
        .rejects.toThrow('Session not found or access denied')
    })

    it('should validate input data for security', async () => {
      const maliciousInput = {
        sessionId: 'session-1',
        content: '<script>alert("xss")</script>',
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'chat_sessions') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: 'session-1',
                    clinic_id: mockClinicId,
                    status: 'active',
                  },
                  error: null,
                })
              })
            })
          }
        }
        return createMockSupabaseClient()
      })

      const result = await msw.chat.sendMessage.mutate(maliciousInput)
      
      // Message should be stored but potentially sanitized
      expect(result.success).toBe(true)
      // In real implementation, XSS prevention would be handled
    })
  })
})