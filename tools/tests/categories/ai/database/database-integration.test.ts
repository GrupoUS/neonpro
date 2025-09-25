/**
 * RED PHASE TESTS - Database Integration
 * 
 * Tests for AI database tables, RLS policies, and data access controls
 * Following TDD methodology - these tests should FAIL initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AgUiRagAgent } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/agent'
import { SupabaseManager } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/database'
import { AgentConfig, AIProvider } from '../../../../../apps/api/agents/ag-ui-rag-agent/src/config'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('AI Agent Database - Integration', () => {
  let agent: AgUiRagAgent
  let mockConfig: AgentConfig
  let mockDbManager: any

  beforeEach(() => {
    vi.clearAllMocks()
    
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

    // Mock database manager
    mockDbManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      supabase: mockSupabaseClient,
      get_session: vi.fn(),
      create_session: vi.fn(),
      update_session: vi.fn(),
      cleanup_expired_sessions: vi.fn().mockResolvedValue(3),
      get_conversation_history: vi.fn(),
      log_query: vi.fn(),
      store_embedding: vi.fn(),
      search_embeddings: vi.fn(),
      get_model_performance: vi.fn(),
      log_prediction: vi.fn(),
      validate_data_access: vi.fn(),
    }

    vi.mocked(SupabaseManager).mockImplementation(() => mockDbManager)
  })

  describe('Database Connection', () => {
    it('should establish connection to Supabase', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(mockDbManager.initialize).toHaveBeenCalled()
      expect(agent.db_manager).toBe(mockDbManager)
    })

    it('should handle connection failures gracefully', async () => {
      mockDbManager.initialize.mockRejectedValue(new Error('Connection failed'))

      agent = new AgUiRagAgent(mockConfig)
      
      await expect(agent.initialize()).rejects.toThrow('Connection failed')
      expect(agent._initialized).toBe(false)
    })

    it('should validate database schema on connection', async () => {
      const schemaValidation = {
        ai_logs_table: true,
        ai_predictions_table: true,
        ai_model_performance_table: true,
        rag_agent_query_log_table: true,
        ai_chat_sessions_table: true,
        ai_audit_events_table: true,
      }

      mockDbManager.validate_schema = vi.fn().mockResolvedValue(schemaValidation)

      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      expect(mockDbManager.validate_schema).toHaveBeenCalled()
    })

    it('should handle missing database tables', async () => {
      const schemaValidation = {
        ai_logs_table: false,
        ai_predictions_table: true,
        ai_model_performance_table: true,
        rag_agent_query_log_table: false,
        ai_chat_sessions_table: true,
        ai_audit_events_table: true,
      }

      mockDbManager.validate_schema = vi.fn().mockResolvedValue(schemaValidation)

      agent = new AgUiRagAgent(mockConfig)
      
      await expect(agent.initialize()).rejects.toThrow('Missing required tables')
    })
  })

  describe('AI Logs Table Operations', () => {
    it('should store AI interaction logs', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const logEntry = {
        query_id: 'Q001',
        session_id: 'S001',
        user_id: 'U001',
        patient_id: 'P001',
        query: 'Test query',
        response: 'Test response',
        provider: 'openai',
        model: 'gpt-4',
        tokens_used: { prompt: 10, completion: 20 },
        response_time_ms: 1500,
        timestamp: new Date().toISOString(),
      }

      const mockTableBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [logEntry], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await mockDbManager.log_ai_interaction(logEntry)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_logs')
      expect(mockTableBuilder.insert).toHaveBeenCalledWith(logEntry)
    })

    it('should retrieve AI interaction history', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const mockHistory = [
        {
          id: 1,
          query_id: 'Q001',
          query: 'What treatments are available?',
          response: 'We offer various treatments...',
          timestamp: '2024-01-20T10:00:00Z',
        },
        {
          id: 2,
          query_id: 'Q002',
          query: 'How much does it cost?',
          response: 'Costs vary depending on treatment...',
          timestamp: '2024-01-20T10:05:00Z',
        },
      ]

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: mockHistory, error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      const history = await mockDbManager.get_ai_interaction_history('U001', 10)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_logs')
      expect(history).toEqual(mockHistory)
    })

    it('should handle AI log query failures', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: null, error: 'Database error' }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await expect(mockDbManager.get_ai_interaction_history('U001', 10))
        .rejects.toThrow('Database error')
    })
  })

  describe('AI Predictions Table Operations', () => {
    it('should store AI predictions with metadata', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const prediction = {
        prediction_id: 'P001',
        model: 'gpt-4',
        input_text: 'Patient has severe acne',
        prediction: 'recommend_isotretinoin',
        confidence: 0.85,
        metadata: {
          treatment_options: ['isotretinoin', 'antibiotics', 'topical_retinoids'],
          severity_assessment: 'severe',
          patient_age: 25,
        },
        timestamp: new Date().toISOString(),
      }

      const mockTableBuilder = {
        insert: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [prediction], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await mockDbManager.store_prediction(prediction)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_predictions')
      expect(mockTableBuilder.insert).toHaveBeenCalledWith(prediction)
    })

    it('should retrieve model predictions for analysis', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const mockPredictions = [
        {
          id: 1,
          model: 'gpt-4',
          prediction: 'recommend_isotretinoin',
          confidence: 0.85,
          actual_outcome: 'successful_treatment',
          timestamp: '2024-01-20T10:00:00Z',
        },
      ]

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: mockPredictions, error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      const predictions = await mockDbManager.get_model_predictions('gpt-4', '2024-01-01', '2024-01-31')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_predictions')
      expect(predictions).toEqual(mockPredictions)
    })

    it('should update prediction outcomes', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const updateData = {
        prediction_id: 'P001',
        actual_outcome: 'successful_treatment',
        outcome_timestamp: new Date().toISOString(),
        treatment_effectiveness: 0.9,
        side_effects: ['dry_skin', 'mild_irritation'],
      }

      const mockTableBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [updateData], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await mockDbManager.update_prediction_outcome(updateData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_predictions')
      expect(mockTableBuilder.update).toHaveBeenCalledWith({
        actual_outcome: updateData.actual_outcome,
        outcome_timestamp: updateData.outcome_timestamp,
        treatment_effectiveness: updateData.treatment_effectiveness,
        side_effects: updateData.side_effects,
      })
    })
  })

  describe('AI Model Performance Table Operations', () => {
    it('should track model performance metrics', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const performanceMetrics = {
        model: 'gpt-4',
        provider: 'openai',
        timestamp: new Date().toISOString(),
        metrics: {
          average_response_time: 1200,
          success_rate: 0.98,
          error_rate: 0.02,
          token_efficiency: 0.85,
          user_satisfaction: 4.2,
        },
        query_volume: 150,
        total_tokens: 45000,
        cost_usd: 2.25,
      }

      const mockTableBuilder = {
        insert: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [performanceMetrics], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await mockDbManager.log_model_performance(performanceMetrics)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_model_performance')
      expect(mockTableBuilder.insert).toHaveBeenCalledWith(performanceMetrics)
    })

    it('should retrieve performance analytics', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const mockAnalytics = {
        model: 'gpt-4',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        metrics: {
          average_response_time: 1150,
          success_rate: 0.97,
          cost_per_query: 0.015,
          user_satisfaction: 4.1,
        },
        query_count: 3200,
        total_cost: 48.00,
      }

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [mockAnalytics], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      const analytics = await mockDbManager.get_performance_analytics('gpt-4', '2024-01-01', '2024-01-31')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_model_performance')
      expect(analytics).toEqual(mockAnalytics)
    })

    it('should compare model performance', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const comparisonData = [
        {
          model: 'gpt-4',
          provider: 'openai',
          avg_response_time: 1200,
          success_rate: 0.98,
          cost_per_1k_tokens: 0.03,
        },
        {
          model: 'claude-3',
          provider: 'anthropic',
          avg_response_time: 900,
          success_rate: 0.96,
          cost_per_1k_tokens: 0.025,
        },
      ]

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: comparisonData, error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      const comparison = await mockDbManager.compare_model_performance(
        ['gpt-4', 'claude-3'],
        '2024-01-01',
        '2024-01-31'
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_model_performance')
      expect(comparison).toEqual(comparisonData)
    })
  })

  describe('RAG Agent Query Log Operations', () => {
    it('should log RAG agent queries with context', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const ragQuery = {
        query_id: 'RAG001',
        session_id: 'S001',
        user_id: 'U001',
        patient_id: 'P001',
        query: 'What are the treatment options for acne?',
        response_type: 'treatment_recommendation',
        context_used: {
          patient_history: true,
          medical_knowledge: true,
          treatment_database: true,
        },
        timestamp: new Date().toISOString(),
      }

      const mockTableBuilder = {
        insert: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [ragQuery], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      await mockDbManager.log_rag_query(ragQuery)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('rag_agent_query_log')
      expect(mockTableBuilder.insert).toHaveBeenCalledWith(ragQuery)
    })

    it('should retrieve RAG query analytics', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const mockAnalytics = {
        total_queries: 1250,
        context_usage: {
          patient_history: 0.8,
          medical_knowledge: 0.9,
          treatment_database: 0.7,
        },
        response_types: {
          treatment_recommendation: 0.4,
          general_information: 0.3,
          scheduling: 0.2,
          financial: 0.1,
        },
      }

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ data: [mockAnalytics], error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockTableBuilder)

      const analytics = await mockDbManager.get_rag_analytics('2024-01-01', '2024-01-31')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('rag_agent_query_log')
      expect(analytics).toEqual(mockAnalytics)
    })
  })

  describe('Row Level Security (RLS)', () => {
    it('should enforce user-based data access', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const userContext = {
        user_id: 'U001',
        role: 'CLINICAL_STAFF',
        clinic_id: 'C001',
        permissions: ['view_patient_data', 'make_recommendations'],
      }

      const canAccess = await mockDbManager.validate_data_access(
        'P001',
        'view',
        userContext
      )

      expect(canAccess).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patient_data')
    })

    it('should prevent unauthorized data access', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const userContext = {
        user_id: 'U002',
        role: 'SUPPORT_READONLY',
        clinic_id: 'C002',
        permissions: ['view_system_status'],
      }

      const canAccess = await mockDbManager.validate_data_access(
        'P001',
        'view',
        userContext
      )

      expect(canAccess).toBe(false)
    })

    it('should enforce clinic-based data isolation', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const userContext = {
        user_id: 'U001',
        role: 'CLINICAL_STAFF',
        clinic_id: 'C001',
        permissions: ['view_patient_data'],
      }

      const accessiblePatients = await mockDbManager.get_accessible_patients(userContext)

      expect(Array.isArray(accessiblePatients)).toBe(true)
      accessiblePatients.forEach(patient => {
        expect(patient.clinic_id).toBe('C001')
      })
    })

    it('should handle role-based data access', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const adminContext = {
        user_id: 'U001',
        role: 'ADMIN',
        clinic_id: 'C001',
        permissions: ['view_all_data'],
      }

      const staffContext = {
        user_id: 'U002',
        role: 'CLINICAL_STAFF',
        clinic_id: 'C001',
        permissions: ['view_assigned_patients'],
      }

      const adminAccess = await mockDbManager.validate_data_access('P001', 'view', adminContext)
      const staffAccess = await mockDbManager.validate_data_access('P001', 'view', staffContext)

      expect(adminAccess).toBe(true)
      expect(staffAccess).toBe(false) // Assuming P001 is not assigned to U002
    })
  })

  describe('Data Consistency and Integrity', () => {
    it('should maintain referential integrity', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      // Test that session logs reference valid sessions
      const validSession = {
        id: 'S001',
        user_id: 'U001',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockDbManager.get_session.mockResolvedValue(validSession)

      const isValid = await mockDbManager.validate_session_reference('S001')

      expect(isValid).toBe(true)
    })

    it('should handle orphaned data cleanup', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const cleanupResult = await mockDbManager.cleanup_orphaned_data()

      expect(cleanupResult).toHaveProperty('sessions_cleaned')
      expect(cleanupResult).toHaveProperty('logs_cleaned')
      expect(cleanupResult).toHaveProperty('embeddings_cleaned')
      expect(typeof cleanupResult.sessions_cleaned).toBe('number')
      expect(typeof cleanupResult.logs_cleaned).toBe('number')
      expect(typeof cleanupResult.embeddings_cleaned).toBe('number')
    })

    it('should validate data consistency', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const consistencyReport = await mockDbManager.validate_data_consistency()

      expect(consistencyReport).toHaveProperty('overall_health')
      expect(consistencyReport).toHaveProperty('tables_checked')
      expect(consistencyReport).toHaveProperty('issues_found')
      expect(consistencyReport).toHaveProperty('recommendations')
    })
  })

  describe('Database Performance', () => {
    it('should monitor query performance', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const queryMetrics = {
        query_type: 'get_session',
        execution_time_ms: 15,
        rows_returned: 1,
        index_used: true,
        timestamp: new Date().toISOString(),
      }

      await mockDbManager.log_query_performance(queryMetrics)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('query_performance_log')
    })

    it('should detect slow queries', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const slowQueries = await mockDbManager.get_slow_queries(1000) // 1 second threshold

      expect(Array.isArray(slowQueries)).toBe(true)
      slowQueries.forEach(query => {
        expect(query.execution_time_ms).toBeGreaterThan(1000)
        expect(query.optimization_recommendation).toBeDefined()
      })
    })

    it('should provide database health metrics', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const healthMetrics = await mockDbManager.get_database_health()

      expect(healthMetrics).toHaveProperty('connection_pool_status')
      expect(healthMetrics).toHaveProperty('active_connections')
      expect(healthMetrics).toHaveProperty('query_performance')
      expect(healthMetrics).toHaveProperty('storage_usage')
      expect(healthMetrics).toHaveProperty('backup_status')
    })
  })

  describe('Backup and Recovery', () => {
    it('should create data backups', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const backupResult = await mockDbManager.create_backup()

      expect(backupResult).toHaveProperty('backup_id')
      expect(backupResult).toHaveProperty('timestamp')
      expect(backupResult).toHaveProperty('tables_backed_up')
      expect(backupResult).toHaveProperty('backup_size_bytes')
      expect(backupResult).toHaveProperty('backup_location')
    })

    it('should verify backup integrity', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const backupId = 'backup_20240120_120000'
      const integrityCheck = await mockDbManager.verify_backup_integrity(backupId)

      expect(integrityCheck).toHaveProperty('backup_id')
      expect(integrityCheck).toHaveProperty('integrity_verified')
      expect(integrityCheck).toHaveProperty('checksum_verified')
      expect(integrityCheck).toHaveProperty('data_consistency_check')
    })

    it('should restore from backup', async () => {
      agent = new AgUiRagAgent(mockConfig)
      await agent.initialize()

      const backupId = 'backup_20240120_120000'
      const restoreResult = await mockDbManager.restore_from_backup(backupId)

      expect(restoreResult).toHaveProperty('backup_id')
      expect(restoreResult).toHaveProperty('restore_timestamp')
      expect(restoreResult).toHaveProperty('tables_restored')
      expect(restoreResult).toHaveProperty('restore_status')
    })
  })
})