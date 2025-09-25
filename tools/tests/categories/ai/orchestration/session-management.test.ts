/**
 * RED PHASE TESTS - Session Management and Context Persistence
 * 
 * Tests for session lifecycle, context persistence, and WebSocket management
 * Following TDD methodology - these tests should FAIL initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AgUiRagAgent } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/agent'
import { AgentConfig, AIProvider } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/config'
import { SupabaseManager } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/database'

// Mock dependencies
vi.mock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database')
vi.mock('websockets')

describe('AI Agent Orchestration - Session Management', () => {
  let agent: AgUiRagAgent
  let mockConfig: AgentConfig
  let mockDbManager: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    mockConfig = {
      name: 'test-agent',
      version: '1.0.0',
      environment: 'test',
      ai: {
        provider: AIProvider.OPENAI,
        model: 'gpt-4',
        api_key: 'test-key',
        max_tokens: 1000,
        temperature: 0.7,
      },
      database: {
        supabase_url: 'https://test.supabase.co',
        supabase_key: 'test-key',
      },
      compliance: {
        enabled_standards: ['LGPD', 'ANVISA'],
        audit_logging: true,
        pii_detection: true,
      },
      embedding: {
        model: 'text-embedding-ada-002',
        batch_size: 100,
      },
    }

    mockDbManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
      get_session: vi.fn(),
      create_session: vi.fn(),
      update_session: vi.fn(),
      cleanup_expired_sessions: vi.fn().mockResolvedValue(3),
      supabase: {
        table: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        execute: vi.fn(),
      },
    }

    vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager)

    agent = new AgUiRagAgent(mockConfig)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Session Creation', () => {
    it('should create new session when session does not exist', async () => {
      mockDbManager.get_session.mockResolvedValue(null)
      
      const mockSession = {
        id: 'test-session-id',
        user_id: 'test-user',
        title: 'Healthcare Assistant Session',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
      
      mockDbManager.create_session.mockResolvedValue(mockSession)

      await agent.initialize()

      const session = await agent['_get_or_create_session']('test-session-id', 'test-user')

      expect(session).toEqual(mockSession)
      expect(mockDbManager.get_session).toHaveBeenCalledWith('test-session-id')
      expect(mockDbManager.create_session).toHaveBeenCalledWith({
        session_id: 'test-session-id',
        user_id: 'test-user',
        title: 'Healthcare Assistant Session',
        context: {},
        expires_at: expect.any(String)
      })

      // Verify session is cached locally
      expect(agent.agent_sessions['test-session-id']).toEqual({
        user_id: 'test-user',
        created_at: expect.any(Date),
        expires_at: expect.any(Date),
        context: {}
      })
    })

    it('should return existing session when session exists', async () => {
      const existingSession = {
        id: 'existing-session-id',
        user_id: 'test-user',
        context: { previous_topics: ['treatment'] },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(existingSession)

      await agent.initialize()

      const session = await agent['_get_or_create_session']('existing-session-id', 'test-user')

      expect(session).toEqual(existingSession)
      expect(mockDbManager.get_session).toHaveBeenCalledWith('existing-session-id')
      expect(mockDbManager.create_session).not.toHaveBeenCalled()
    })

    it('should update session activity timestamp on retrieval', async () => {
      const existingSession = {
        id: 'existing-session-id',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(existingSession)

      await agent.initialize()

      await agent['_get_or_create_session']('existing-session-id', 'test-user')

      expect(mockDbManager.update_session).toHaveBeenCalledWith(
        'existing-session-id',
        {
          updated_at: expect.any(String)
        }
      )
    })

    it('should handle session creation failures', async () => {
      mockDbManager.get_session.mockResolvedValue(null)
      mockDbManager.create_session.mockRejectedValue(new Error('Database error'))

      await agent.initialize()

      await expect(agent['_get_or_create_session']('test-session-id', 'test-user'))
        .rejects.toThrow('Database error')
    })
  })

  describe('Session Context Management', () => {
    it('should update session context with new conversation', async () => {
      // Setup existing session
      const existingSession = {
        id: 'test-session',
        user_id: 'test-user',
        context: {
          conversation_history: [
            {
              query: 'Previous question',
              response: 'Previous response',
              timestamp: new Date().toISOString()
            }
          ]
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(existingSession)

      await agent.initialize()

      // Set session in cache
      agent.agent_sessions['test-session'] = {
        user_id: 'test-user',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        context: existingSession.context
      }

      const newQuery = 'What treatments are available?'
      const newResponse = {
        content: 'We offer various aesthetic treatments...',
        type: 'normal'
      }

      await agent['_update_session_context']('test-session', newQuery, newResponse)

      // Verify context was updated
      expect(mockDbManager.update_session).toHaveBeenCalledWith(
        'test-session',
        {
          context: {
            conversation_history: [
              {
                query: 'Previous question',
                response: 'Previous response',
                timestamp: expect.any(String)
              },
              {
                query: newQuery,
                response: newResponse.content,
                timestamp: expect.any(String)
              }
            ]
          },
          updated_at: expect.any(String)
        }
      )

      // Verify local cache was updated
      expect(agent.agent_sessions['test-session'].context.conversation_history).toHaveLength(2)
    })

    it('should limit conversation history to last 10 messages', async () => {
      // Create session with 10 existing messages
      const existingHistory = Array.from({ length: 10 }, (_, i) => ({
        query: `Question ${i}`,
        response: `Response ${i}`,
        timestamp: new Date().toISOString()
      }))

      const existingSession = {
        id: 'test-session',
        user_id: 'test-user',
        context: { conversation_history: existingHistory },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(existingSession)

      await agent.initialize()

      agent.agent_sessions['test-session'] = {
        user_id: 'test-user',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        context: existingSession.context
      }

      const newQuery = 'New question'
      const newResponse = { content: 'New response', type: 'normal' }

      await agent['_update_session_context']('test-session', newQuery, newResponse)

      // Should have 10 messages (oldest removed)
      const updatedContext = mockDbManager.update_session.mock.calls[0][1].context
      expect(updatedContext.conversation_history).toHaveLength(10)
      expect(updatedContext.conversation_history[0].query).toBe('Question 1') // Question 0 removed
      expect(updatedContext.conversation_history[9].query).toBe(newQuery) // New question added
    })

    it('should create conversation history if it does not exist', async () => {
      const existingSession = {
        id: 'test-session',
        user_id: 'test-user',
        context: {}, // No conversation history
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(existingSession)

      await agent.initialize()

      agent.agent_sessions['test-session'] = {
        user_id: 'test-user',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        context: {}
      }

      const newQuery = 'First question'
      const newResponse = { content: 'First response', type: 'normal' }

      await agent['_update_session_context']('test-session', newQuery, newResponse)

      const updatedContext = mockDbManager.update_session.mock.calls[0][1].context
      expect(updatedContext.conversation_history).toHaveLength(1)
      expect(updatedContext.conversation_history[0].query).toBe(newQuery)
    })

    it('should handle context update errors gracefully', async () => {
      mockDbManager.update_session.mockRejectedValue(new Error('Update failed'))

      await agent.initialize()

      agent.agent_sessions['test-session'] = {
        user_id: 'test-user',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        context: {}
      }

      const newQuery = 'Test question'
      const newResponse = { content: 'Test response', type: 'normal' }

      // Should not throw error, should log it instead
      await expect(agent['_update_session_context']('test-session', newQuery, newResponse))
        .resolves.not.toThrow()
    })
  })

  describe('Session Cleanup', () => {
    it('should clean up inactive sessions', async () => {
      await agent.initialize()

      // Setup sessions with different activity times
      const now = new Date()
      const activeTime = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
      const inactiveTime = new Date(now.getTime() - 90 * 60 * 1000) // 90 minutes ago

      agent.agent_sessions = {
        'active-session': {
          user_id: 'user1',
          created_at: activeTime,
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          last_activity: activeTime,
          context: {}
        },
        'inactive-session': {
          user_id: 'user2',
          created_at: inactiveTime,
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          last_activity: inactiveTime,
          context: {}
        }
      }

      const cleanedCount = await agent.cleanup_inactive_sessions()

      expect(cleanedCount).toBe(1)
      expect(agent.agent_sessions).toHaveProperty('active-session')
      expect(agent.agent_sessions).not.toHaveProperty('inactive-session')
    })

    it('should clean up expired sessions from database', async () => {
      await agent.initialize()

      // Advance timers to trigger cleanup
      vi.advanceTimersByTime(1800 * 1000) // 30 minutes

      expect(mockDbManager.cleanup_expired_sessions).toHaveBeenCalled()
    })

    it('should handle cleanup errors gracefully', async () => {
      mockDbManager.cleanup_expired_sessions.mockRejectedValue(new Error('Cleanup failed'))

      await agent.initialize()

      vi.advanceTimersByTime(1800 * 1000) // 30 minutes

      // Should not throw error
      expect(mockDbManager.cleanup_expired_sessions).toHaveBeenCalled()
    })
  })

  describe('Session Expiry', () => {
    it('should create sessions with 24-hour expiry', async () => {
      mockDbManager.get_session.mockResolvedValue(null)
      
      const mockSession = {
        id: 'test-session',
        user_id: 'test-user',
        title: 'Healthcare Assistant Session',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: expect.any(String),
      }

      mockDbManager.create_session.mockResolvedValue(mockSession)

      await agent.initialize()

      await agent['_get_or_create_session']('test-session', 'test-user')

      const callArgs = mockDbManager.create_session.mock.calls[0][0]
      const expiresAt = new Date(callArgs.expires_at)
      const createdAt = new Date()

      const timeDiff = expiresAt.getTime() - createdAt.getTime()
      expect(timeDiff).toBeCloseTo(24 * 60 * 60 * 1000, 1000) // 24 hours ± 1 second
    })

    it('should handle session expiry during access', async () => {
      const expiredSession = {
        id: 'expired-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      }

      mockDbManager.get_session.mockResolvedValue(expiredSession)

      await agent.initialize()

      // Should create new session when expired
      const newSession = {
        id: 'new-session',
        user_id: 'test-user',
        title: 'Healthcare Assistant Session',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.create_session.mockResolvedValue(newSession)

      const session = await agent['_get_or_create_session']('expired-session', 'test-user')

      expect(session).toEqual(newSession)
      expect(mockDbManager.create_session).toHaveBeenCalled()
    })
  })

  describe('Session Persistence', () => {
    it('should persist session context to database', async () => {
      mockDbManager.get_session.mockResolvedValue(null)
      
      const mockSession = {
        id: 'test-session',
        user_id: 'test-user',
        title: 'Healthcare Assistant Session',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.create_session.mockResolvedValue(mockSession)

      await agent.initialize()

      const session = await agent['_get_or_create_session']('test-session', 'test-user')

      // Verify session is stored in local cache
      expect(agent.agent_sessions['test-session']).toBeDefined()
      expect(agent.agent_sessions['test-session'].user_id).toBe('test-user')
    })

    it('should load session context from database', async () => {
      const storedSession = {
        id: 'stored-session',
        user_id: 'test-user',
        context: {
          conversation_history: [
            {
              query: 'Stored question',
              response: 'Stored response',
              timestamp: new Date().toISOString()
            }
          ]
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(storedSession)

      await agent.initialize()

      const session = await agent['_get_or_create_session']('stored-session', 'test-user')

      expect(session).toEqual(storedSession)
      expect(mockDbManager.update_session).not.toHaveBeenCalled() // No update needed for retrieval
    })

    it('should handle session data corruption', async () => {
      mockDbManager.get_session.mockResolvedValue({
        id: 'corrupted-session',
        user_id: 'test-user',
        context: 'invalid-json-context', // Corrupted context
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      // Should handle corrupted data gracefully
      const session = await agent['_get_or_create_session']('corrupted-session', 'test-user')

      expect(session).toBeDefined()
    })
  })

  describe('Session Analytics', () => {
    it('should track session metrics', async () => {
      await agent.initialize()

      // Create some test sessions
      agent.agent_sessions = {
        'session1': {
          user_id: 'user1',
          created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000),
          context: { conversation_history: Array(5).fill({}) }
        },
        'session2': {
          user_id: 'user2',
          created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          expires_at: new Date(Date.now() + 23.5 * 60 * 60 * 1000),
          context: { conversation_history: Array(3).fill({}) }
        }
      }

      const status = await agent.get_agent_status()

      expect(status.connections.active_sessions).toBe(2)
      expect(status.analytics.total_conversations).toBe(8) // 5 + 3 messages
    })

    it('should calculate session duration correctly', async () => {
      await agent.initialize()

      const sessionStartTime = new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      agent.agent_sessions = {
        'long-session': {
          user_id: 'user1',
          created_at: sessionStartTime,
          expires_at: new Date(Date.now() + 23 * 15 * 60 * 1000),
          context: { conversation_history: [] }
        }
      }

      const status = await agent.get_agent_status()

      expect(status.analytics.average_session_duration_minutes).toBe(45)
    })
  })
})