/**
 * RED PHASE TESTS - AI Agent Initialization
 * 
 * Tests for AG-UI RAG Agent initialization, configuration, and component setup
 * Following TDD methodology - these tests should FAIL initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AgUiRagAgent } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/agent'
import { AgentConfig, AIProvider } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/config'
import { SupabaseManager } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/database'

// Mock dependencies
vi.mock('../../../../../apps/api/agents/ag-ui-rag-agent/src/database')
vi.mock('../../../../../apps/api/agents/ag-ui-rag-agent/src/vector_store')
vi.mock('../../../../../apps/api/agents/ag-ui-rag-agent/src/embeddings')
vi.mock('../../../../../apps/api/agents/ag-ui-rag-agent/src/retriever')

describe('AI Agent Orchestration - Initialization', () => {
  let agent: AgUiRagAgent
  let mockConfig: AgentConfig

  beforeEach(() => {
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
    vi.clearAllMocks()
  })

  describe('Agent Configuration', () => {
    it('should create agent with valid configuration', () => {
      agent = new AgUiRagAgent(mockConfig)
      
      expect(agent).toBeDefined()
      expect(agent.config).toEqual(mockConfig)
      expect(agent._initialized).toBe(false)
      expect(agent.active_connections).toEqual({})
      expect(agent.agent_sessions).toEqual({})
    })

    it('should validate required configuration fields', () => {
      const invalidConfig = { ...mockConfig }
      delete (invalidConfig as any).ai
      
      expect(() => {
        new AgUiRagAgent(invalidConfig as any)
      }).toThrow('Missing required configuration: ai')
    })

    it('should validate AI provider configuration', () => {
      const invalidConfig = {
        ...mockConfig,
        ai: { ...mockConfig.ai, provider: 'invalid-provider' as any }
      }
      
      expect(() => {
        new AgUiRagAgent(invalidConfig)
      }).toThrow('Invalid AI provider: invalid-provider')
    })

    it('should validate compliance settings', () => {
      const configWithoutCompliance = { ...mockConfig }
      delete (configWithoutCompliance as any).compliance
      
      agent = new AgUiRagAgent(configWithoutCompliance as any)
      expect(agent.config.compliance).toBeDefined()
      expect(agent.config.compliance.enabled_standards).toEqual([])
    })
  })

  describe('Component Initialization', () => {
    it('should initialize database manager', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
      }
      vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager as any)

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(mockDbManager.initialize).toHaveBeenCalled()
      expect(agent.db_manager).toBe(mockDbManager)
    })

    it('should initialize embedding manager', async () => {
      const mockEmbeddingManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        warm_up: vi.fn().mockResolvedValue(undefined),
      }
      
      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/embeddings', () => ({
        EmbeddingManager: vi.fn().mockReturnValue(mockEmbeddingManager)
      }))

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(mockEmbeddingManager.initialize).toHaveBeenCalled()
      expect(mockEmbeddingManager.warm_up).toHaveBeenCalled()
    })

    it('should initialize vector store manager', async () => {
      const mockVectorStore = {
        initialize: vi.fn().mockResolvedValue(undefined),
        create_embedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      }
      
      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/vector_store', () => ({
        VectorStoreManager: vi.fn().mockReturnValue(mockVectorStore)
      }))

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(mockVectorStore.initialize).toHaveBeenCalled()
      expect(mockVectorStore.create_embedding).toHaveBeenCalledWith('Warm-up test for vector store')
    })

    it('should initialize healthcare retriever', async () => {
      const mockHealthcareRetriever = {
        get_relevant_context: vi.fn().mockResolvedValue({
          results: [],
          query: 'test query',
          limit: 10
        }),
      }
      
      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/retriever', () => ({
        HealthcareRetriever: vi.fn().mockReturnValue(mockHealthcareRetriever)
      }))

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(agent.healthcare_retriever).toBe(mockHealthcareRetriever)
    })
  })

  describe('AI Client Initialization', () => {
    it('should initialize OpenAI client', async () => {
      const openai = await import('openai')
      const mockOpenAI = {
        ChatCompletion: {
          acreate: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }],
            usage: { prompt_tokens: 10, completion_tokens: 5 }
          })
        }
      }
      
      vi.doMock('openai', () => mockOpenAI)

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(openai.api_key).toBe(mockConfig.ai.api_key)
    })

    it('should initialize Anthropic client', async () => {
      const anthropic = await import('anthropic')
      const mockAnthropic = {
        Anthropic: vi.fn().mockReturnValue({
          messages: {
            create: vi.fn().mockResolvedValue({
              content: [{ text: 'Test response' }],
              usage: { input_tokens: 10, output_tokens: 5 }
            })
          }
        })
      }
      
      vi.doMock('anthropic', () => mockAnthropic)

      const anthropicConfig = {
        ...mockConfig,
        ai: { ...mockConfig.ai, provider: AIProvider.ANTHROPIC }
      }

      agent = new AgUiRagAgent(anthropicConfig)
      await agent.initialize()

      expect(anthropic.Anthropic).toHaveBeenCalledWith({
        api_key: mockConfig.ai.api_key
      })
    })

    it('should handle local AI provider', async () => {
      const localConfig = {
        ...mockConfig,
        ai: { ...mockConfig.ai, provider: AIProvider.LOCAL }
      }

      agent = new AgUiRagAgent(localConfig)
      await agent.initialize()

      // Local AI provider should not initialize external clients
      expect(agent.anthropic_client).toBeUndefined()
    })
  })

  describe('Background Tasks', () => {
    it('should start session cleanup loop', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
      const cleanupSpy = vi.spyOn(agent, 'cleanup_inactive_sessions')
      
      await agent.initialize()

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        3600000 // 1 hour
      )
    })

    it('should start expired sessions cleanup', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        cleanup_expired_sessions: vi.fn().mockResolvedValue(5),
      }
      vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager as any)

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      // Wait for cleanup to be scheduled
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(mockDbManager.cleanup_expired_sessions).toHaveBeenCalled()
    })
  })

  describe('Initialization Failure Handling', () => {
    it('should handle database initialization failure', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      }
      vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager as any)

      agent = new AgUiRagAgent(mockConfig)
      
      await expect(agent.initialize()).rejects.toThrow('Database connection failed')
      expect(agent._initialized).toBe(false)
    })

    it('should handle component warm-up failure gracefully', async () => {
      const mockEmbeddingManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        warm_up: vi.fn().mockRejectedValue(new Error('Warm-up failed')),
      }
      
      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/embeddings', () => ({
        EmbeddingManager: vi.fn().mockReturnValue(mockEmbeddingManager)
      }))

      agent = new AgUiRagAgent(mockConfig)
      
      // Should not throw on warm-up failure
      await expect(agent.initialize()).resolves.not.toThrow()
      expect(agent._initialized).toBe(true)
    })

    it('should prevent double initialization', async () => {
      const mockDbManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
      }
      vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager as any)

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()
      await agent.initialize()

      expect(mockDbManager.initialize).toHaveBeenCalledTimes(1)
    })
  })

  describe('Agent Status', () => {
    it('should return agent status information', async () => {
      const mockVectorStore = {
        get_statistics: vi.fn().mockResolvedValue({
          total_embeddings: 1000,
          average_similarity: 0.85
        }),
      }
      
      vi.doMock('../../../../../apps/api/agents/ag-ui-rag-agent/src/vector_store', () => ({
        VectorStoreManager: vi.fn().mockReturnValue(mockVectorStore)
      }))

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const status = await agent.get_agent_status()

      expect(status.agent.name).toBe(mockConfig.name)
      expect(status.agent.version).toBe(mockConfig.version)
      expect(status.agent.initialized).toBe(true)
      expect(status.components.vector_store).toEqual({
        total_embeddings: 1000,
        average_similarity: 0.85
      })
      expect(status.connections.active_sessions).toBe(0)
      expect(status.compliance.enabled_standards).toEqual(['LGPD', 'ANVISA'])
    })

    it('should handle status retrieval errors', async () => {
      agent = new AgUiRagAgent(mockConfig)
      
      vi.spyOn(agent, 'get_agent_status').mockRejectedValue(new Error('Status error'))
      
      await expect(agent.get_agent_status()).rejects.toThrow('Status error')
    })
  })
})