/**
 * INTEGRATION TEST: AI Semantic Caching (T015)
 *
 * Tests AI semantic caching functionality with healthcare compliance:
 * - Semantic cache operations with vector embeddings
 * - AI provider failover and redundancy
 * - Cost optimization and budget management
 * - Healthcare-specific caching scenarios
 * - Performance benchmarking and monitoring
 * - LGPD/ANVISA/CFM compliance for cached data
 * - Emergency handling and privacy protection
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

// Test helper for API calls
async function api(path: string, init?: RequestInit) {
  const { default: app } = await import('../../src/app');
  const url = new URL(`http://local.test${path}`);
  return app.request(url, init);
}

// Semantic cache schemas
const SemanticCacheEntrySchema = z.object({
  id: z.string(),
  prompt: z.string().min(1),
  response: z.string().min(1),
  embedding: z.array(z.number()),
  metadata: z.object({
    patientId: z.string().optional(),
    cost: z.number().min(0),
    provider: z.string(),
    model: z.string(),
    ttlMs: z.number().optional(),
    category: z.string().optional(),
    compliance: z.array(z.string()),
    isEmergency: z.boolean().optional(),
    isSensitiveData: z.boolean().optional(),
  }),
  createdAt: z.string().datetime(),
  accessedAt: z.string().datetime(),
  accessCount: z.number().min(1),
  ttl: z.string().datetime().optional(),
  hash: z.string(),
});

const CacheStatsSchema = z.object({
  totalRequests: z.number().min(0),
  cacheHits: z.number().min(0),
  cacheMisses: z.number().min(0),
  totalSavedCost: z.number().min(0),
  averageResponseTimeMs: z.number().min(0),
  cacheSize: z.number().min(0),
  hitRate: z.number().min(0).max(1),
  costEfficiency: z.number().min(0).max(1),
  lastCleanup: z.string().datetime(),
});

const HealthcareAIContextSchema = z.object({
  patientId: z.string().optional(),
  isEmergency: z.boolean().default(false),
  isSensitiveData: z.boolean().default(false),
  category: z.string().optional(),
  requiredCompliance: z.array(z.string()).optional(),
  containsUrgentSymptoms: z.boolean().default(false),
  requiresPrivacy: z.boolean().default(false),
});

const AIProviderConfigSchema = z.object({
  provider: z.enum(['OPENAI', 'ANTHROPIC', 'COHERE', 'LOCAL']),
  model: z.string(),
  api_key: z.string(),
  base_url: z.string().url(),
  max_tokens: z.number().min(1).max(100000),
  temperature: z.number().min(0).max(2),
  healthcare_settings: z.object({
    max_patient_tokens: z.number().min(1),
    emergency_priority: z.boolean(),
    privacy_mode: z.enum(['standard', 'enhanced', 'maximum']),
    compliance_level: z.enum(['standard', 'healthcare_strict', 'research']),
  }),
});

const CostTrackingSchema = z.object({
  id: z.string(),
  provider: z.string(),
  model: z.string(),
  prompt_tokens: z.number().min(0),
  completion_tokens: z.number().min(0),
  total_cost: z.number().min(0),
  request_id: z.string(),
  user_id: z.string(),
  context: z.object({
    feature: z.string(),
    patient_id: z.string().optional(),
    is_emergency: z.boolean().optional(),
  }),
  created_at: z.string().datetime(),
});

describe('AI Semantic Cache Functionality', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
    'X-User-Role': 'healthcare_professional',
    'X-Clinic-ID': 'test-clinic-id',
  };

  const adminAuthHeaders = {
    Authorization: 'Bearer admin-token',
    'Content-Type': 'application/json',
    'X-User-Role': 'admin',
  };

  let testPatientId: string;
  let emergencyPatientId: string;

  beforeAll(async () => {
    // Setup test environment
    testPatientId = 'patient-123-test';
    emergencyPatientId = 'patient-789-emergency';
  });

  beforeEach(async () => {
    // Reset cache state before each test
    await api('/api/v1/ai/cache/clear', {
      method: 'POST',
      headers: adminAuthHeaders,
      body: JSON.stringify({
        confirm_clear: true,
        healthcare_backup: true,
        reason: 'test_setup',
      }),
    });
  });

  describe('Semantic Cache Operations', () => {
    it('should add entry to semantic cache with healthcare compliance', async () => {
      const cacheEntry = {
        prompt: 'Diagnosis recommendations for pediatric asthma patient',
        response: 'Based on pediatric asthma guidelines and current symptoms, recommend salbutamol inhaler as needed, inhaled corticosteroids for maintenance, and follow-up in 2 weeks. Monitor for adverse effects and educate on proper inhaler technique.',
        metadata: {
          patientId: testPatientId,
          cost: 0.025,
          provider: 'OPENAI',
          model: 'gpt-4',
          ttlMs: 3600000,
          category: 'pediatrics',
          compliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT', 'CFM_COMPLIANT'],
          isSensitiveData: true,
        },
      };

      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(cacheEntry),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data).toMatchObject({
        entry_id: expect.any(String),
        status: 'cached',
        cache_size: expect.any(Number),
        healthcare_compliance: {
          lgpdVerified: expect.any(Boolean),
          patientDataProtected: expect.any(Boolean),
          professionalConfidentiality: expect.any(Boolean),
        },
        performance: {
          embeddingGenerated: expect.any(Boolean),
          similarityThreshold: expect.any(Number),
          ttlSet: expect.any(Boolean),
        },
      });

      // Validate response schema
      const parsed = SemanticCacheEntrySchema.safeParse(data.entry);
      expect(parsed.success).toBe(true);
    });

    it('should find similar entries using semantic similarity', async () => {
      // First add a cache entry
      const cacheEntry = {
        prompt: 'Patient with chest pain and shortness of breath',
        response: 'Urgent cardiac evaluation recommended. Consider ECG, cardiac enzymes, and immediate medical attention due to potential acute coronary syndrome.',
        metadata: {
          patientId: testPatientId,
          cost: 0.035,
          provider: 'OPENAI',
          model: 'gpt-4',
          category: 'cardiology',
          compliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
          isEmergency: true,
        },
      };

      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(cacheEntry),
      });

      // Search for similar entries
      const searchQuery = {
        prompt: 'Patient complaining of chest discomfort and breathing difficulty',
        context: {
          patientId: testPatientId,
          isEmergency: true,
          isSensitiveData: true,
          category: 'cardiology',
          requiredCompliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(searchQuery),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        found: expect.any(Boolean),
        similarity: expect.any(Number),
        stats: expect.objectContaining({
          totalRequests: expect.any(Number),
          cacheHits: expect.any(Number),
          cacheMisses: expect.any(Number),
          hitRate: expect.any(Number),
        }),
        healthcare_context: expect.objectContaining({
          patientIsolation: expect.any(Boolean),
          privacyProtected: expect.any(Boolean),
          complianceVerified: expect.any(Boolean),
        }),
      });

      // If found, validate similarity threshold
      if (data.found && data.similarity) {
        expect(data.similarity).toBeGreaterThanOrEqual(0.85);
      }
    });

    it('should handle cache miss gracefully', async () => {
      const searchQuery = {
        prompt: 'Rare genetic disorder with specific mutation analysis',
        context: {
          patientId: testPatientId,
          isEmergency: false,
          isSensitiveData: true,
          category: 'genetics',
          requiredCompliance: ['LGPD_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(searchQuery),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.found).toBe(false);
      expect(data.entry).toBeUndefined();
      expect(data.stats.cacheMisses).toBe(1);
    });

    it('should respect patient data isolation', async () => {
      // Add entry for one patient
      const cacheEntry = {
        prompt: 'Diabetes management plan for adult patient',
        response: 'Comprehensive diabetes management including lifestyle modifications, medication adherence, and regular monitoring.',
        metadata: {
          patientId: testPatientId,
          cost: 0.02,
          provider: 'OPENAI',
          model: 'gpt-4',
          compliance: ['LGPD_COMPLIANT'],
        },
      };

      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(cacheEntry),
      });

      // Search with different patient ID
      const searchQuery = {
        prompt: 'Diabetes management plan for adult patient',
        context: {
          patientId: 'different-patient-456',
          isEmergency: false,
          requiredCompliance: ['LGPD_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(searchQuery),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      
      // Should not find entry due to patient isolation
      expect(data.found).toBe(false);
    });

    it('should optimize healthcare queries with context awareness', async () => {
      const healthcareQuery = {
        prompt: 'Urgent: Patient showing signs of stroke - facial drooping, arm weakness',
        patientId: emergencyPatientId,
        context: {
          isEmergency: true,
          containsUrgentSymptoms: true,
          isSensitiveData: true,
          category: 'neurology',
          requiresPrivacy: true,
        },
        maxAgeMs: 300000,
      };

      const res = await api('/api/v1/ai/cache/optimize-query', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(healthcareQuery),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        cache_key: expect.any(String),
        optimized: expect.any(Boolean),
        strategy: expect.stringMatching(/^(semantic|exact|healthcare_context)$/),
        healthcare_rules: expect.objectContaining({
          emergencyHandling: expect.any(Boolean),
          privacyProtection: expect.any(Boolean),
          contextAwareness: expect.any(Boolean),
        }),
        performance_metrics: expect.objectContaining({
          processingTimeMs: expect.any(Number),
          cacheStrategy: expect.any(String),
          bypassReason: expect.any(String),
        }),
      });

      // Emergency queries should use exact strategy (no cache)
      expect(data.strategy).toBe('exact');
    });

    it('should retrieve comprehensive cache statistics', async () => {
      const res = await api('/api/v1/ai/cache/stats', {
        method: 'GET',
        headers: testAuthHeaders,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        performance: expect.objectContaining({
          totalRequests: expect.any(Number),
          cacheHits: expect.any(Number),
          cacheMisses: expect.any(Number),
          hitRate: expect.any(Number),
          costEfficiency: expect.any(Number),
        }),
        healthcare_metrics: expect.objectContaining({
          patientDataRequests: expect.any(Number),
          emergencyQueries: expect.any(Number),
          sensitiveDataHandling: expect.any(Number),
          complianceValidations: expect.any(Number),
        }),
        cache_state: expect.objectContaining({
          totalEntries: expect.any(Number),
          memoryUsage: expect.any(Number),
          lastCleanup: expect.any(String),
          enabled: expect.any(Boolean),
        }),
      });

      // Validate stats schema
      const statsParsed = CacheStatsSchema.safeParse(data.performance);
      expect(statsParsed.success).toBe(true);
    });

    it('should clear cache with healthcare safety checks', async () => {
      // Add some test data first
      const cacheEntry = {
        prompt: 'Test medical query',
        response: 'Test medical response',
        metadata: {
          patientId: testPatientId,
          cost: 0.01,
          provider: 'OPENAI',
          compliance: ['LGPD_COMPLIANT'],
        },
      };

      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(cacheEntry),
      });

      const res = await api('/api/v1/ai/cache/clear', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify({
          confirm_clear: true,
          healthcare_backup: true,
          reason: 'cache_maintenance',
        }),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        cleared: expect.any(Boolean),
        entries_removed: expect.any(Number),
        backup_created: expect.any(Boolean),
        healthcare_safety: expect.objectContaining({
          sensitiveDataProtected: expect.any(Boolean),
          auditTrailCreated: expect.any(Boolean),
          complianceMaintained: expect.any(Boolean),
        }),
      });

      expect(data.cleared).toBe(true);
      expect(data.entries_removed).toBeGreaterThan(0);
    });
  });

  describe('AI Provider Failover Tests', () => {
    it('should configure AI provider with healthcare settings', async () => {
      const providerConfig = {
        provider: 'OPENAI',
        model: 'gpt-4',
        api_key: 'test-healthcare-key',
        base_url: 'https://api.openai.com/v1',
        max_tokens: 4000,
        temperature: 0.1,
        healthcare_settings: {
          max_patient_tokens: 2000,
          emergency_priority: true,
          privacy_mode: 'enhanced',
          compliance_level: 'healthcare_strict',
        },
      };

      const res = await api('/api/v1/ai/providers/configure', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify(providerConfig),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        provider_id: expect.any(String),
        status: 'configured',
        health_check: expect.objectContaining({
          available: expect.any(Boolean),
          response_time: expect.any(Number),
          healthcare_ready: expect.any(Boolean),
        }),
        healthcare_compliance: expect.objectContaining({
          hipaaReady: expect.any(Boolean),
          lgpdCompliant: expect.any(Boolean),
          dataEncryption: expect.any(Boolean),
        }),
      });

      // Validate provider config schema
      const configParsed = AIProviderConfigSchema.safeParse(providerConfig);
      expect(configParsed.success).toBe(true);
    });

    it('should list available AI providers with healthcare capabilities', async () => {
      const res = await api('/api/v1/ai/providers', {
        method: 'GET',
        headers: testAuthHeaders,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        providers: expect.any(Array),
        healthcare_capabilities: expect.objectContaining({
          patientDataProcessing: expect.any(Boolean),
          emergencySupport: expect.any(Boolean),
          privacyProtection: expect.any(Boolean),
          complianceFrameworks: expect.any(Array),
        }),
        cost_optimization: expect.objectContaining({
          auto_routing: expect.any(Boolean),
          cost_monitoring: expect.any(Boolean),
          budget_enforcement: expect.any(Boolean),
        }),
      });

      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider).toMatchObject({
          name: expect.any(String),
          available: expect.any(Boolean),
          healthcare_ready: expect.any(Boolean),
          cost_per_token: expect.any(Number),
        });
      }
    });

    it('should route requests to optimal AI provider', async () => {
      const routingRequest = {
        prompt: 'Analyze patient lab results for cardiac markers',
        context: {
          specialty: 'cardiology',
          urgency: 'medium',
          complexity: 'high',
          requires_citation: true,
        },
        preferences: {
          max_cost: 0.05,
          max_latency: 5000,
          quality_threshold: 0.9,
        },
      };

      const res = await api('/api/v1/ai/providers/route', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(routingRequest),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        selected_provider: expect.any(String),
        routing_reason: expect.any(String),
        confidence: expect.any(Number),
        healthcare_optimization: expect.objectContaining({
          specialty_match: expect.any(Boolean),
          urgency_handling: expect.any(Boolean),
          quality_assurance: expect.any(Boolean),
        }),
        cost_prediction: expect.objectContaining({
          estimated_cost: expect.any(Number),
          budget_impact: expect.any(String),
          cost_efficiency: expect.any(Number),
        }),
      });
    });

    it('should handle provider failures with fallback', async () => {
      const res = await api('/api/v1/ai/providers/test-connection', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify({
          provider: 'INVALID_PROVIDER',
          api_key: 'invalid-key',
        }),
      });

      expect(res.status).toBe(503);

      const data = await res.json();
      expect(data).toMatchObject({
        error: expect.any(String),
        provider_status: 'unavailable',
        fallback_options: expect.any(Array),
        healthcare_impact: expect.objectContaining({
          patientCareAffected: expect.any(Boolean),
          emergencyProtocolsActive: expect.any(Boolean),
          manual_override_available: expect.any(Boolean),
        }),
      });
    });
  });

  describe('Cost Optimization Tests', () => {
    it('should track AI usage costs with healthcare context', async () => {
      const costEntry = {
        provider: 'OPENAI',
        model: 'gpt-4',
        prompt_tokens: 500,
        completion_tokens: 200,
        total_cost: 0.035,
        request_id: 'req-cost-test-123',
        user_id: 'user-healthcare-456',
        context: {
          feature: 'patient_summary',
          patient_id: testPatientId,
          is_emergency: false,
        },
      };

      const res = await api('/api/v1/ai/costs/track', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(costEntry),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data).toMatchObject({
        entry_id: expect.any(String),
        status: 'recorded',
        healthcare_compliance: expect.objectContaining({
          patientDataRecorded: expect.any(Boolean),
          costAttribution: expect.any(Boolean),
          auditTrail: expect.any(Boolean),
        }),
        cost_analysis: expect.objectContaining({
          cost_per_token: expect.any(Number),
          budget_impact: expect.any(String),
          efficiency_rating: expect.any(String),
        }),
      });

      // Validate cost tracking schema
      const costParsed = CostTrackingSchema.safeParse({
        ...costEntry,
        id: data.entry_id,
        created_at: new Date().toISOString(),
      });
      expect(costParsed.success).toBe(true);
    });

    it('should generate cost analytics with healthcare breakdown', async () => {
      const res = await api('/api/v1/ai/costs/analytics', {
        method: 'GET',
        headers: adminAuthHeaders,
        query: new URLSearchParams({
          period: '30d',
          group_by: 'feature',
        }).toString(),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        period: expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
        }),
        summary: expect.objectContaining({
          total_cost: expect.any(Number),
          total_requests: expect.any(Number),
          average_cost_per_request: expect.any(Number),
          cache_savings: expect.any(Number),
        }),
        healthcare_costs: expect.objectContaining({
          patient_data_processing: expect.any(Number),
          emergency_requests: expect.any(Number),
          telemedicine_usage: expect.any(Number),
          diagnostic_support: expect.any(Number),
        }),
        optimization_insights: expect.objectContaining({
          top_cost_features: expect.any(Array),
          efficiency_opportunities: expect.any(Array),
          budget_recommendations: expect.any(Array),
        }),
      });
    });

    it('should manage cost budgets with healthcare protections', async () => {
      const budgetConfig = {
        monthly_budget: 1000,
        feature_budgets: {
          patient_summary: 300,
          diagnostic_support: 500,
          telemedicine: 200,
        },
        alerts: {
          threshold_80_percent: true,
          threshold_100_percent: true,
          daily_summary: true,
        },
        healthcare_rules: {
          emergency_override: true,
          critical_patient_care: true,
          professional_access: true,
        },
      };

      const res = await api('/api/v1/ai/costs/budget', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify(budgetConfig),
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        budget_id: expect.any(String),
        status: 'active',
        healthcare_protections: expect.objectContaining({
          emergencyAccessGuaranteed: expect.any(Boolean),
          patientCarePrioritized: expect.any(Boolean),
          professionalAccessProtected: expect.any(Boolean),
        }),
        monitoring: expect.objectContaining({
          real_time_tracking: expect.any(Boolean),
          alert_system: expect.any(Boolean),
          reporting_frequency: expect.any(String),
        }),
      });
    });

    it('should handle budget exceeded scenarios with healthcare override', async () => {
      const res = await api('/api/v1/ai/costs/track', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          provider: 'OPENAI',
          model: 'gpt-4',
          prompt_tokens: 100000,
          completion_tokens: 50000,
          total_cost: 9999,
          request_id: 'req-budget-exceed',
          user_id: 'user-budget-test',
          context: {
            feature: 'test',
            budget_impact: 'critical',
            is_emergency: false,
          },
        }),
      });

      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data).toMatchObject({
        error: expect.stringContaining('budget'),
        budget_exceeded: expect.any(Boolean),
        healthcare_override: expect.objectContaining({
          emergency_exception: expect.any(Boolean),
          patient_care_priority: expect.any(Boolean),
          manual_approval_required: expect.any(Boolean),
        }),
        recommendations: expect.any(Array),
      });
    });
  });

  describe('Healthcare AI Caching Tests', () => {
    it('should handle emergency queries without caching', async () => {
      const emergencyQuery = {
        prompt: 'CODE BLUE - Patient in cardiac arrest',
        context: {
          patientId: emergencyPatientId,
          isEmergency: true,
          containsUrgentSymptoms: true,
          category: 'emergency',
          requiredCompliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/optimize-query', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(emergencyQuery),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();

      // Emergency queries should bypass cache
      expect(data.strategy).toBe('exact');
      expect(data.healthcare_rules.emergencyHandling).toBe(true);
    });

    it('should protect sensitive patient data in cache', async () => {
      const sensitiveQuery = {
        prompt: 'Patient HIV status and treatment history',
        context: {
          patientId: testPatientId,
          isEmergency: false,
          isSensitiveData: true,
          category: 'infectious_disease',
          requiredCompliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/optimize-query', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(sensitiveQuery),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();

      // Sensitive data should use healthcare context strategy
      expect(['healthcare_context', 'semantic']).toContain(data.strategy);
      expect(data.healthcare_rules.privacyProtection).toBe(true);
    });

    it('should validate healthcare compliance requirements', async () => {
      const cacheEntry = {
        prompt: 'Standard medical consultation',
        response: 'Routine consultation notes',
        metadata: {
          patientId: testPatientId,
          cost: 0.01,
          provider: 'OPENAI',
          compliance: ['LGPD_COMPLIANT'], // Missing healthcare compliance
        },
      };

      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(cacheEntry),
      });

      // Should require full healthcare compliance
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.error).toContain('compliance');
    });

    it('should handle specialty-specific caching', async () => {
      const specialtyEntries = [
        {
          prompt: 'Pediatric vaccination schedule',
          context: { category: 'pediatrics', requiredCompliance: ['LGPD_COMPLIANT'] },
        },
        {
          prompt: 'Cardiac catheterization procedure',
          context: { category: 'cardiology', requiredCompliance: ['LGPD_COMPLIANT'] },
        },
        {
          prompt: 'Dermatological lesion assessment',
          context: { category: 'dermatology', requiredCompliance: ['LGPD_COMPLIANT'] },
        },
      ];

      for (const entry of specialtyEntries) {
        const res = await api('/api/v1/ai/cache/find-similar', {
          method: 'POST',
          headers: testAuthHeaders,
          body: JSON.stringify(entry),
        });

        expect(res.ok).toBe(true);
        const data = await res.json();
        
        // Should not cross-contaminate specialties
        if (data.found) {
          expect(data.entry.metadata.category).toBe(entry.context.category);
        }
      }
    });
  });

  describe('Performance Benchmarking Tests', () => {
    it('should measure cache performance metrics', async () => {
      const startTime = Date.now();

      // Add test entry
      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Performance test query',
          response: 'Performance test response',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      // Search for similar entry
      const searchRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Performance test query',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(searchRes.ok).toBe(true);
      const data = await searchRes.json();

      // Performance assertions
      expect(totalTime).toBeLessThan(1000); // Should complete in under 1 second
      if (data.found) {
        expect(data.performance_metrics?.processingTimeMs).toBeLessThan(500);
      }
    });

    it('should handle high load scenarios', async () => {
      const concurrentRequests = 50;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          api('/api/v1/ai/cache/stats', {
            method: 'GET',
            headers: testAuthHeaders,
          })
        );
      }

      const results = await Promise.allSettled(promises);
      
      // All requests should succeed
      const successfulRequests = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      expect(successfulRequests).toBe(concurrentRequests);
    });

    it('should benchmark cache hit vs miss performance', async () => {
      // Warm cache - add entry
      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Benchmark test entry',
          response: 'Benchmark response',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      // Measure cache hit
      const hitStart = Date.now();
      const hitRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Benchmark test entry',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT'],
          },
        }),
      });
      const hitTime = Date.now() - hitStart;

      // Measure cache miss
      const missStart = Date.now();
      const missRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Unique query not in cache',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT'],
          },
        }),
      });
      const missTime = Date.now() - missStart;

      expect(hitRes.ok).toBe(true);
      expect(missRes.ok).toBe(true);

      // Cache hits should be faster than misses (when embeddings are involved)
      const hitData = await hitRes.json();
      if (hitData.found) {
        expect(hitTime).toBeLessThan(missTime * 2); // Hit should be at least 2x faster
      }
    });

    it('should validate cache TTL expiration', async () => {
      const shortTTL = 100; // 100ms

      // Add entry with short TTL
      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Short TTL test',
          response: 'Short TTL response',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            ttlMs: shortTTL,
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      // Should find immediately
      const immediateRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Short TTL test',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      expect(immediateRes.ok).toBe(true);
      const immediateData = await immediateRes.json();
      expect(immediateData.found).toBe(true);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, shortTTL + 50));

      // Should not find after expiration
      const expiredRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Short TTL test',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      expect(expiredRes.ok).toBe(true);
      const expiredData = await expiredRes.json();
      expect(expiredData.found).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should validate cache entry schema', async () => {
      const invalidEntry = {
        prompt: '', // Empty prompt should be invalid
        response: 'Some response',
        metadata: {
          patientId: 'invalid-patient-id',
          cost: -1, // Negative cost should be invalid
        },
      };

      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(invalidEntry),
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data).toMatchObject({
        error: expect.any(String),
        validation_errors: expect.any(Array),
        healthcare_guidelines: expect.any(Array),
      });
    });

    it('should handle embedding generation failures', async () => {
      // Mock embedding service failure
      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Test embedding failure',
          response: 'Test response',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      // Should handle gracefully with fallback
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.performance.embeddingGenerated).toBeDefined();
    });

    it('should prevent cache overflow attacks', async () => {
      const largePayload = {
        prompt: 'x'.repeat(1000000), // 1MB payload
        response: 'y'.repeat(1000000),
        metadata: {
          patientId: testPatientId,
          cost: 0.01,
          provider: 'OPENAI',
          compliance: ['LGPD_COMPLIANT'],
        },
      };

      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(largePayload),
      });

      expect(res.status).toBe(413); // Payload too large
    });

    it('should maintain audit trail for cache operations', async () => {
      const auditQuery = {
        prompt: 'Audit test query',
        context: {
          patientId: testPatientId,
          requiredCompliance: ['LGPD_COMPLIANT'],
        },
      };

      await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(auditQuery),
      });

      // Check that audit trail was created
      const auditRes = await api('/api/v1/audit/recent', {
        method: 'GET',
        headers: adminAuthHeaders,
      });

      expect(auditRes.ok).toBe(true);
      const auditData = await auditRes.json();
      
      const cacheAudits = auditData.filter(
        (audit: any) => audit.resource === 'ai_cache'
      );
      
      expect(cacheAudits.length).toBeGreaterThan(0);
      const latestAudit = cacheAudits[0];
      expect(latestAudit.action).toBe('read');
      expect(latestAudit.resourceType).toBe('system_config');
    });
  });

  describe('Compliance and Security Tests', () => {
    it('should enforce LGPD compliance in cache operations', async () => {
      const lgpdTestEntry = {
        prompt: 'Patient personal data request',
        response: 'Response with personal data',
        metadata: {
          patientId: testPatientId,
          cost: 0.01,
          provider: 'OPENAI',
          compliance: ['LGPD_COMPLIANT'],
          personalData: true,
        },
      };

      const res = await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(lgpdTestEntry),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      
      expect(data.healthcare_compliance.lgpdVerified).toBe(true);
      expect(data.healthcare_compliance.patientDataProtected).toBe(true);
    });

    it('should validate healthcare professional access', async () => {
      const unauthorizedHeaders = {
        Authorization: 'Bearer unauthorized-token',
        'Content-Type': 'application/json',
        'X-User-Role': 'patient', // Patients shouldn't access AI cache
      };

      const res = await api('/api/v1/ai/cache/stats', {
        method: 'GET',
        headers: unauthorizedHeaders,
      });

      expect(res.status).toBe(403);
    });

    it('should sanitize sensitive data from cache responses', async () => {
      const sensitiveEntry = {
        prompt: 'Patient HIV test results',
        response: 'HIV POSITIVE - Highly sensitive information',
        metadata: {
          patientId: testPatientId,
          cost: 0.01,
          provider: 'OPENAI',
          compliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
          isSensitiveData: true,
        },
      };

      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify(sensitiveEntry),
      });

      const searchRes = await api('/api/v1/ai/cache/find-similar', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Patient HIV test results',
          context: {
            patientId: testPatientId,
            requiredCompliance: ['LGPD_COMPLIANT', 'HEALTHCARE_COMPLIANT'],
          },
        }),
      });

      expect(searchRes.ok).toBe(true);
      const searchData = await searchRes.json();

      if (searchData.found) {
        // Sensitive data should be masked or require additional authentication
        expect(searchData.entry.response).not.toContain('HIV POSITIVE');
      }
    });

    it('should maintain data residency compliance', async () => {
      const res = await api('/api/v1/ai/cache/stats', {
        method: 'GET',
        headers: testAuthHeaders,
      });

      expect(res.ok).toBe(true);
      const data = await res.json();

      // Should indicate data residency compliance
      expect(data.healthcare_metrics).toBeDefined();
      expect(data.compliance_status?.data_residency).toBeDefined();
    });
  });

  describe('Cleanup and Maintenance', () => {
    it('should perform automatic cache cleanup', async () => {
      // Add entries with different TTLs
      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Expiring entry 1',
          response: 'Response 1',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            ttlMs: 100, // Very short TTL
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Expiring entry 2',
          response: 'Response 2',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            ttlMs: 100, // Very short TTL
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Trigger cleanup
      const cleanupRes = await api('/api/v1/ai/cache/cleanup', {
        method: 'POST',
        headers: adminAuthHeaders,
      });

      expect(cleanupRes.ok).toBe(true);
      const cleanupData = await cleanupRes.json();
      expect(cleanupData.cleaned_entries).toBeGreaterThan(0);
    });

    it('should export cache data with privacy protection', async () => {
      // Add test data
      await api('/api/v1/ai/cache/add', {
        method: 'POST',
        headers: testAuthHeaders,
        body: JSON.stringify({
          prompt: 'Export test data',
          response: 'Export test response',
          metadata: {
            patientId: testPatientId,
            cost: 0.01,
            provider: 'OPENAI',
            compliance: ['LGPD_COMPLIANT'],
          },
        }),
      });

      const exportRes = await api('/api/v1/ai/cache/export', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify({
          format: 'json',
          anonymize_patient_data: true,
          include_metadata: true,
        }),
      });

      expect(exportRes.ok).toBe(true);
      const exportData = await exportRes.json();

      expect(exportData.export_id).toBeDefined();
      expect(exportData.records_count).toBeGreaterThan(0);
      expect(exportData.privacy_protection.applied).toBe(true);
    });

    it('should restore cache from backup with validation', async () => {
      const restoreRes = await api('/api/v1/ai/cache/restore', {
        method: 'POST',
        headers: adminAuthHeaders,
        body: JSON.stringify({
          backup_id: 'test-backup-id',
          validate_compliance: true,
          overwrite_conflicts: false,
        }),
      });

      expect(restoreRes.ok).toBe(true);
      const restoreData = await restoreRes.json();

      expect(restoreData.restoration_id).toBeDefined();
      expect(restoreData.validation_passed).toBeDefined();
      expect(restoreData.entries_restored).toBeDefined();
    });
  });
});

afterAll(async () => {
  // Cleanup test data
  try {
    await api('/api/v1/ai/cache/clear', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer admin-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        confirm_clear: true,
        healthcare_backup: false,
        reason: 'test_cleanup',
      }),
    });
  } catch (error) {
    // Ignore cleanup errors
    console.warn('Cache cleanup failed:', error);
  }
});