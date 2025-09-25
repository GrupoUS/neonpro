/**
 * RED PHASE TESTS - Performance Testing
 * 
 * Tests for AI Agent performance under load, response times, and resource management
 * Following TDD methodology - these tests should FAIL initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AgUiRagAgent } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/agent'
import { AgentConfig, AIProvider } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/config'

describe('AI Agent Performance - Load and Response Times', () => {
  let agent: AgUiRagAgent
  let mockConfig: AgentConfig

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
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initialization Performance', () => {
    it('should initialize within acceptable time limits', async () => {
      // Mock fast initialization
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
      }

      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database', () => ({
        SupabaseManager: vi.fn().mockReturnValue(mockDbManager)
      }))

      agent = new AgUiRagAgent(mockConfig)

      const startTime = performance.now()
      await agent.initialize()
      const endTime = performance.now()

      const initializationTime = endTime - startTime
      expect(initializationTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should handle slow initialization gracefully', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 8000)) // 8 seconds
        }),
      }

      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database', () => ({
        SupabaseManager: vi.fn().mockReturnValue(mockDbManager)
      }))

      agent = new AgUiRagAgent(mockConfig)

      const startTime = performance.now()
      await agent.initialize()
      const endTime = performance.now()

      const initializationTime = endTime - startTime
      expect(initializationTime).toBeGreaterThan(7000) // Should take at least 7 seconds
      expect(agent._initialized).toBe(true) // Should still complete successfully
    })

    it('should timeout on extremely slow initialization', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 31000)) // 31 seconds
        }),
      }

      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database', () => ({
        SupabaseManager: vi.fn().mockReturnValue(mockDbManager)
      }))

      agent = new AgUiRagAgent(mockConfig)

      // Set timeout for 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), 30000)
      })

      await expect(
        Promise.race([agent.initialize(), timeoutPromise])
      ).rejects.toThrow('Initialization timeout')
    })
  })

  describe('Query Processing Performance', () => {
    it('should process simple queries within acceptable time', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      // Mock fast AI response
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Quick response',
        type: 'normal',
        timestamp: new Date().toISOString(),
        metadata: { performance: { response_time_ms: 100 } }
      })

      // Mock fast database operations
      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      const query = 'Hello'
      const startTime = performance.now()
      const result = await agent.process_query(query, 'session-1', 'user-1')
      const endTime = performance.now()

      const processingTime = endTime - startTime
      expect(processingTime).toBeLessThan(1000) // 1 second max for simple queries
      expect(result.response).toBeDefined()
    })

    it('should handle complex queries efficiently', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      // Mock context retrieval
      vi.spyOn(agent.healthcare_retriever as any, 'get_relevant_context').mockResolvedValue({
        results: Array(20).fill({ type: 'patient_data', data: {} }), // Large context
        query: 'complex medical question',
        limit: 20
      })

      // Mock AI response for complex query
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Detailed medical response with treatment recommendations',
        type: 'treatment_recommendation',
        timestamp: new Date().toISOString(),
        metadata: { performance: { response_time_ms: 800 } }
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      const complexQuery = 'What are the most effective treatments for severe cystic acne in a 25-year-old patient with sensitive skin, considering contraindications and previous treatment failures?'
      const startTime = performance.now()
      const result = await agent.process_query(complexQuery, 'session-1', 'user-1')
      const endTime = performance.now()

      const processingTime = endTime - startTime
      expect(processingTime).toBeLessThan(5000) // 5 seconds max for complex queries
      expect(result.response).toBeDefined()
    })

    it('should maintain performance under concurrent load', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockImplementation(async () => {
        // Simulate variable response times
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
        return {
          content: 'Concurrent response',
          type: 'normal',
          timestamp: new Date().toISOString(),
        }
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      // Simulate 50 concurrent requests
      const concurrentRequests = Array.from({ length: 50 }, (_, i) => 
        agent.process_query(`Concurrent query ${i}`, `session-${i}`, `user-${i % 10}`)
      )

      const startTime = performance.now()
      const results = await Promise.all(concurrentRequests)
      const endTime = performance.now()

      const totalTime = endTime - startTime
      const averageTime = totalTime / 50

      expect(averageTime).toBeLessThan(2000) // Average 2 seconds per request
      expect(results.length).toBe(50)
      expect(results.every(r => r.response)).toBe(true)
    })

    it('should handle request queuing during peak load', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      // Simulate processing bottleneck
      let processingCount = 0
      vi.spyOn(agent, '_generate_ai_response').mockImplementation(async () => {
        processingCount++
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms processing
        processingCount--
        return {
          content: 'Queued response',
          type: 'normal',
          timestamp: new Date().toISOString(),
        }
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      // Send burst of requests
      const burstRequests = Array.from({ length: 100 }, (_, i) => 
        agent.process_query(`Burst query ${i}`, `session-${i}`, `user-${i}`)
      )

      const startTime = performance.now()
      const results = await Promise.allSettled(burstRequests)
      const endTime = performance.now()

      const successful = results.filter(r => r.status === 'fulfilled')
      const failed = results.filter(r => r.status === 'rejected')

      expect(successful.length).toBeGreaterThan(80) // At least 80% should succeed
      expect(endTime - startTime).toBeLessThan(60000) // Should complete within 60 seconds
    })
  })

  describe('Memory Usage', () => {
    it('should manage memory efficiently during long sessions', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Session response',
        type: 'normal',
        timestamp: new Date().toISOString(),
      })

      vi.spyOn(agent, '_get_or_create_session').mockImplementation(async (sessionId, userId) => {
        return {
          id: sessionId,
          user_id: userId,
          context: {
            conversation_history: Array(50).fill({ query: 'old query', response: 'old response' }),
          },
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      })

      await agent.initialize()

      // Simulate long session with many messages
      for (let i = 0; i < 20; i++) {
        await agent.process_query(`Session message ${i}`, 'long-session', 'user-1')
      }

      // Session should be pruned to reasonable size
      const session = agent.agent_sessions['long-session']
      if (session && session.context.conversation_history) {
        expect(session.context.conversation_history.length).toBeLessThanOrEqual(10)
      }
    })

    it('should clean up inactive sessions to free memory', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      // Create many inactive sessions
      const oldTime = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      for (let i = 0; i < 100; i++) {
        agent.agent_sessions[`session-${i}`] = {
          user_id: `user-${i}`,
          created_at: oldTime,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          last_activity: oldTime,
          context: { conversation_history: Array(5).fill({}) },
        }
      }

      const initialMemory = process.memoryUsage?.()
      const cleanedCount = await agent.cleanup_inactive_sessions()
      
      vi.advanceTimersByTime(1000) // Allow cleanup to complete
      
      const finalMemory = process.memoryUsage?.()

      expect(cleanedCount).toBe(100)
      expect(agent.agent_sessions).toHaveLength(0)
      
      // Memory should have decreased (this is approximate in test environment)
      if (initialMemory && finalMemory) {
        expect(finalMemory.heapUsed).toBeLessThanOrEqual(initialMemory.heapUsed * 1.1) // Allow 10% variance
      }
    })
  })

  describe('Provider Performance', () => {
    it('should measure AI provider response times', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      // Mock different response times for different providers
      const providerResponses = {
        openai: { time: 1200, content: 'OpenAI response' },
        anthropic: { time: 800, content: 'Anthropic response' },
        local: { time: 200, content: 'Local response' },
      }

      for (const [provider, response] of Object.entries(providerResponses)) {
        vi.spyOn(agent, `_generate_${provider}_response` as any).mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, response.time))
          return {
            content: response.content,
            provider,
            timestamp: new Date().toISOString(),
          }
        })
      }

      await agent.initialize()

      const performanceResults = {}
      
      for (const provider of Object.keys(providerResponses)) {
        const startTime = performance.now()
        await agent[`_generate_${provider}_response`]([{ role: 'user', content: 'test' }])
        const endTime = performance.now()
        
        performanceResults[provider] = {
          responseTime: endTime - startTime,
          withinThreshold: endTime - startTime < 2000, // 2 second threshold
        }
      }

      expect(performanceResults.openai.withinThreshold).toBe(true)
      expect(performanceResults.anthropic.withinThreshold).toBe(true)
      expect(performanceResults.local.withinThreshold).toBe(true)
    })

    it('should handle provider timeouts gracefully', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_openai_response').mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10000)) // 10 second timeout
        return { content: 'Timeout response', provider: 'openai' }
      })

      await agent.initialize()

      const startTime = performance.now()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Provider timeout')), 5000) // 5 second timeout
      })

      await expect(
        Promise.race([
          agent['_generate_openai_response']([{ role: 'user', content: 'test' }]),
          timeoutPromise
        ])
      ).rejects.toThrow('Provider timeout')
    })
  })

  describe('Database Performance', () => {
    it('should optimize database query performance', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        get_session: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 50)) // 50ms database latency
          return {
            id: 'test-session',
            user_id: 'test-user',
            context: {},
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
        }),
        update_session: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 30)) // 30ms update latency
        }),
      }

      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database', () => ({
        SupabaseManager: vi.fn().mockReturnValue(mockDbManager)
      }))

      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Database test response',
        type: 'normal',
        timestamp: new Date().toISOString(),
      })

      await agent.initialize()

      const startTime = performance.now()
      await agent.process_query('Database test', 'session-1', 'user-1')
      const endTime = performance.now()

      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(1000) // Should be fast despite database latency

      // Database should have been called expected number of times
      expect(mockDbManager.get_session).toHaveBeenCalledTimes(1)
      expect(mockDbManager.update_session).toHaveBeenCalledTimes(1)
    })

    it('should handle database connection pool limits', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        get_session: vi.fn().mockImplementation(async () => {
          // Simulate connection pool limit
          await new Promise(resolve => setTimeout(resolve, 200))
          return {
            id: 'test-session',
            user_id: 'test-user',
            context: {},
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
        }),
      }

      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database', () => ({
        SupabaseManager: vi.fn().mockReturnValue(mockDbManager)
      }))

      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Connection pool test',
        type: 'normal',
        timestamp: new Date().toISOString(),
      })

      await agent.initialize()

      // Test concurrent database access
      const concurrentDbOperations = Array.from({ length: 20 }, (_, i) => 
        agent.process_query(`DB test ${i}`, `session-${i}`, `user-${i}`)
      )

      const startTime = performance.now()
      await Promise.all(concurrentDbOperations)
      const endTime = performance.now()

      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(10000) // Should handle pool limits efficiently
    })
  })

  describe('Scalability Testing', () => {
    it('should scale to handle increasing user loads', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Scalability test response',
        type: 'normal',
        timestamp: new Date().toISOString(),
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      const userCounts = [10, 50, 100, 200]
      const performanceMetrics = []

      for (const userCount of userCounts) {
        const requests = Array.from({ length: userCount }, (_, i) => 
          agent.process_query(`Scale test ${i}`, `session-${i}`, `user-${i % 20}`)
        )

        const startTime = performance.now()
        await Promise.all(requests)
        const endTime = performance.now()

        performanceMetrics.push({
          userCount,
          totalTime: endTime - startTime,
          averageTime: (endTime - startTime) / userCount,
        })
      }

      // Performance should not degrade exponentially
      for (let i = 1; i < performanceMetrics.length; i++) {
        const current = performanceMetrics[i]
        const previous = performanceMetrics[i - 1]
        
        const userRatio = current.userCount / previous.userCount
        const timeRatio = current.averageTime / previous.averageTime
        
        // Time increase should be less than user increase ratio
        expect(timeRatio).toBeLessThan(userRatio * 1.5)
      }
    })

    it('should maintain performance with large conversation contexts', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockImplementation(async () => {
        // Simulate processing time based on context size
        await new Promise(resolve => setTimeout(resolve, 200))
        return {
          content: 'Large context response',
          type: 'normal',
          timestamp: new Date().toISOString(),
        }
      })

      await agent.initialize()

      // Test with increasing context sizes
      const contextSizes = [0, 10, 25, 50, 100]
      const responseTimes = []

      for (const size of contextSizes) {
        const session = {
          id: `session-${size}`,
          user_id: 'test-user',
          context: {
            conversation_history: Array(size).fill({
              query: 'Previous question',
              response: 'Previous response that might be quite long and contain detailed medical information',
              timestamp: new Date().toISOString(),
            }),
          },
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }

        agent.agent_sessions[`session-${size}`] = session

        const startTime = performance.now()
        await agent.process_query(`Test with ${size} context items`, `session-${size}`, 'test-user')
        const endTime = performance.now()

        responseTimes.push({
          contextSize: size,
          responseTime: endTime - startTime,
        })
      }

      // Response time should not grow linearly with context size (due to pruning)
      const lastResponse = responseTimes[responseTimes.length - 1]
      expect(lastResponse.responseTime).toBeLessThan(2000) // Should remain under 2 seconds
    })
  })

  describe('Resource Monitoring', () => {
    it('should track performance metrics', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, '_generate_ai_response').mockResolvedValue({
        content: 'Monitored response',
        type: 'normal',
        timestamp: new Date().toISOString(),
        metadata: {
          performance: {
            response_time_ms: 150,
            memory_used_mb: 50,
            cpu_usage_percent: 15,
          }
        }
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      await agent.process_query('Monitor test', 'session-1', 'user-1')

      const status = await agent.get_agent_status()

      expect(status.performance).toBeDefined()
      expect(status.performance.average_response_time).toBeDefined()
      expect(status.performance.memory_usage).toBeDefined()
      expect(status.performance.cpu_usage).toBeDefined()
    })

    it('should detect performance degradation', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      // Simulate degrading performance
      let callCount = 0
      vi.spyOn(agent, '_generate_ai_response').mockImplementation(async () => {
        callCount++
        const delay = Math.min(callCount * 100, 2000) // Increasing delay
        await new Promise(resolve => setTimeout(resolve, delay))
        return {
          content: 'Degraded response',
          type: 'normal',
          timestamp: new Date().toISOString(),
        }
      })

      vi.spyOn(agent, '_get_or_create_session').mockResolvedValue({
        id: 'test-session',
        user_id: 'test-user',
        context: {},
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await agent.initialize()

      const responseTimes = []
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        await agent.process_query(`Degradation test ${i}`, 'session-1', 'user-1')
        const endTime = performance.now()
        responseTimes.push(endTime - startTime)
      }

      const degradation = responseTimes[responseTimes.length - 1] / responseTimes[0]
      expect(degradation).toBeGreaterThan(2) // Should show significant degradation

      const status = await agent.get_agent_status()
      expect(status.performance.degradation_detected).toBe(true)
      expect(status.performance.recommendations).toBeDefined()
    })
  })
})