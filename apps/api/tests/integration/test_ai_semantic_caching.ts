/**
 * AI Semantic Caching Integration Tests
 *
 * Comprehensive integration tests for AI semantic caching system
 * Covers cache operations, performance optimization, healthcare compliance,
 * and integration with AI provider routing system.
 *
 * Healthcare Compliance Framework:
 * - LGPD: Data processing consent and audit trails
 * - ANVISA: Medical device data handling compliance
 * - CFM: Professional medical standards validation
 * - Data retention and purging policies
 *
 * @version 1.0.0
 * @since Phase 2 Testing Infrastructure
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { aiProviderRouter } from '../../services/ai-provider-router';
import { auditService } from '../../services/audit-service';
import { complianceService } from '../../services/compliance-service';
import { performanceMonitor } from '../../services/performance-monitor';
import { semanticCacheService } from '../../services/semantic-cache-service';

// Schema definitions for validation
const CacheEntrySchema = z.object({
  id: z.string(),
  key: z.string(),
  query: z.string(),
  response: z.object({
    content: z.string(),
    tokens: z.number(),
    model: z.string(),
    provider: z.string(),
    timestamp: z.string(),
    metadata: z.record(z.any()).optional(),
  }),
  similarityScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  ttl: z.number().positive(),
  createdAt: z.string(),
  accessedAt: z.string().optional(),
  accessCount: z.number().min(0),
  healthcareContext: z.object({
    patientId: z.string().optional(),
    sessionId: z.string().optional(),
    department: z.string(),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
    dataCategory: z.enum(['diagnostic', 'treatment', 'administrative', 'research']),
  }),
  lgpdCompliance: z.object({
    dataProcessed: z.boolean(),
    legalBasis: z.enum(['consent', 'vital_interests', 'public_interest', 'legitimate_interest']),
    consentId: z.string().optional(),
    retentionPeriod: z.number().positive(),
    anonymized: z.boolean(),
  }),
  anvisaCompliance: z.object({
    medicalDeviceData: z.boolean(),
    classification: z.string().optional(),
    validationRequired: z.boolean(),
    auditTrail: z.boolean(),
  }),
  cfmCompliance: z.object({
    professionalContext: z.boolean(),
    decisionSupport: z.boolean(),
    supervisionRequired: z.boolean(),
    ethicalGuidelines: z.boolean(),
  }),
});

const CachePerformanceMetricsSchema = z.object({
  hitRate: z.number().min(0).max(1),
  missRate: z.number().min(0).max(1),
  averageResponseTime: z.number().positive(),
  cacheEfficiency: z.number().min(0).max(1),
  storageUsage: z.number().min(0),
  memoryUsage: z.number().min(0),
  cpuUsage: z.number().min(0).max(1),
  networkLatency: z.number().positive(),
  errorRate: z.number().min(0).max(1),
  healthcareSpecific: z.object({
    diagnosticCacheAccuracy: z.number().min(0).max(1),
    treatmentRecommendationAccuracy: z.number().min(0).max(1),
    patientDataProtectionScore: z.number().min(0).max(1),
    complianceValidationTime: z.number().positive(),
  }),
});

const CacheStatsSchema = z.object({
  totalEntries: z.number().min(0),
  activeEntries: z.number().min(0),
  expiredEntries: z.number().min(0),
  sizeBytes: z.number().min(0),
  hitCount: z.number().min(0),
  missCount: z.number().min(0),
  evictionCount: z.number().min(0),
  averageEntrySize: z.number().min(0),
  oldestEntryAge: z.number().min(0),
  newestEntryAge: z.number().min(0),
  healthcareBreakdown: z.object({
    diagnosticQueries: z.number().min(0),
    treatmentQueries: z.number().min(0),
    administrativeQueries: z.number().min(0),
    researchQueries: z.number().min(0),
    emergencyQueries: z.number().min(0),
  }),
});

const CacheInvalidationRequestSchema = z.object({
  pattern: z.string(),
  reason: z.enum(['explicit', 'ttl_expired', 'size_limit', 'compliance', 'data_update']),
  healthcareContext: z.object({
    patientId: z.string().optional(),
    sessionId: z.string().optional(),
    dataCategory: z.enum(['diagnostic', 'treatment', 'administrative', 'research']).optional(),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  }).optional(),
  compliance: z.object({
    lggd: z.boolean().optional(),
    anvisa: z.boolean().optional(),
    cfm: z.boolean().optional(),
    retentionPolicy: z.boolean().optional(),
  }).optional(),
});

// Mock services and utilities
const mockAuditService = {
  logCacheOperation: vi.fn(),
  logComplianceCheck: vi.fn(),
  logPerformanceMetrics: vi.fn(),
  logSecurityEvent: vi.fn(),
  getAuditTrail: vi.fn(),
};

const mockComplianceService = {
  validateLGPD: vi.fn(),
  validateANVISA: vi.fn(),
  validateCFM: vi.fn(),
  checkDataRetention: vi.fn(),
  anonymizeData: vi.fn(),
  getComplianceReport: vi.fn(),
};

const mockPerformanceMonitor = {
  recordMetric: vi.fn(),
  getMetrics: vi.fn(),
  startTimer: vi.fn(),
  endTimer: vi.fn(),
  alertOnThreshold: vi.fn(),
};

const mockAIProvider = {
  generateResponse: vi.fn(),
  getEmbedding: vi.fn(),
  checkHealth: vi.fn(),
  getUsageStats: vi.fn(),
};

// Test data generators
const generateValidCacheQuery = () => ({
  query: 'What are the common symptoms of diabetes in elderly patients?',
  context: {
    patientId: 'patient_789',
    sessionId: 'session_456',
    department: 'endocrinology',
    urgencyLevel: 'medium' as const,
    dataCategory: 'diagnostic' as const,
  },
  metadata: {
    source: 'clinical_decision_support',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  },
});

const generateValidCacheEntry = () => ({
  key: 'cache_key_123',
  query: 'Common diabetes symptoms in elderly',
  response: {
    content:
      'Common symptoms of diabetes in elderly patients include increased thirst, frequent urination, unexplained weight loss, fatigue, blurred vision, slow-healing sores, and frequent infections...',
    tokens: 150,
    model: 'gpt-4',
    provider: 'openai',
    timestamp: new Date().toISOString(),
    metadata: {
      confidence: 0.92,
      sources: ['medical_literature', 'clinical_guidelines'],
      references: ['ADA_2023_Guidelines'],
    },
  },
  similarityScore: 0.85,
  confidence: 0.92,
  ttl: 3600000, // 1 hour
  healthcareContext: {
    patientId: 'patient_789',
    sessionId: 'session_456',
    department: 'endocrinology',
    urgencyLevel: 'medium' as const,
    dataCategory: 'diagnostic' as const,
  },
  lgpdCompliance: {
    dataProcessed: true,
    legalBasis: 'vital_interests' as const,
    retentionPeriod: 86400000, // 24 hours
    anonymized: true,
  },
  anvisaCompliance: {
    medicalDeviceData: true,
    classification: 'Class_I',
    validationRequired: true,
    auditTrail: true,
  },
  cfmCompliance: {
    professionalContext: true,
    decisionSupport: true,
    supervisionRequired: true,
    ethicalGuidelines: true,
  },
});

const generateValidPerformanceMetrics = () => ({
  hitRate: 0.78,
  missRate: 0.22,
  averageResponseTime: 125,
  cacheEfficiency: 0.82,
  storageUsage: 52428800, // 50MB
  memoryUsage: 104857600, // 100MB
  cpuUsage: 0.35,
  networkLatency: 45,
  errorRate: 0.02,
  healthcareSpecific: {
    diagnosticCacheAccuracy: 0.89,
    treatmentRecommendationAccuracy: 0.91,
    patientDataProtectionScore: 0.98,
    complianceValidationTime: 15,
  },
});

const generateValidInvalidationRequest = () => ({
  pattern: 'patient_*',
  reason: 'compliance' as const,
  healthcareContext: {
    patientId: 'patient_789',
    dataCategory: 'diagnostic' as const,
    urgency: 'high' as const,
  },
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    retentionPolicy: true,
  },
});

describe('AI Semantic Caching Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockAuditService.logCacheOperation.mockResolvedValue({ success: true });
    mockComplianceService.validateLGPD.mockResolvedValue({ valid: true, score: 0.98 });
    mockComplianceService.validateANVISA.mockResolvedValue({ valid: true, score: 0.95 });
    mockComplianceService.validateCFM.mockResolvedValue({ valid: true, score: 0.97 });
    mockPerformanceMonitor.recordMetric.mockResolvedValue({ success: true });
    mockAIProvider.generateResponse.mockResolvedValue({
      content: 'AI generated response',
      tokens: 100,
      model: 'gpt-4',
      provider: 'openai',
    });
  });

  describe('Cache Operations', () => {
    it('should store and retrieve cache entries successfully', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      // Store cache entry
      const storeResult = await semanticCacheService.store(queryData, cacheEntry);
      expect(storeResult.success).toBe(true);
      expect(storeResult.entryId).toBeDefined();

      // Verify schema compliance
      const parsedEntry = CacheEntrySchema.safeParse(cacheEntry);
      expect(parsedEntry.success).toBe(true);

      // Retrieve cache entry
      const retrieveResult = await semanticCacheService.retrieve(queryData.query);
      expect(retrieveResult.success).toBe(true);
      expect(retrieveResult.entry).toEqual(expect.objectContaining({
        query: cacheEntry.query,
        response: cacheEntry.response,
      }));

      // Verify audit logging
      expect(mockAuditService.logCacheOperation).toHaveBeenCalledTimes(2);
      expect(mockComplianceService.validateLGPD).toHaveBeenCalled();
    });

    it('should handle cache misses gracefully', async () => {
      const query = 'Unique query not in cache';

      const result = await semanticCacheService.retrieve(query);
      expect(result.success).toBe(false);
      expect(result.error).toBe('CACHE_MISS');

      // Verify fallback to AI provider
      expect(mockAIProvider.generateResponse).toHaveBeenCalled();
    });

    it('should validate healthcare compliance on cache operations', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      // Modify to trigger compliance failure
      mockComplianceService.validateLGPD.mockResolvedValueOnce({
        valid: false,
        score: 0.45,
        violations: ['insufficient_consent'],
      });

      await expect(semanticCacheService.store(queryData, cacheEntry))
        .rejects.toThrow('LGPD_COMPLIANCE_FAILED');
    });

    it('should handle cache expiration and TTL management', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = {
        ...generateValidCacheEntry(),
        ttl: 1000, // Very short TTL for testing
      };

      // Store entry with short TTL
      await semanticCacheService.store(queryData, cacheEntry);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Attempt retrieval after expiration
      const result = await semanticCacheService.retrieve(queryData.query);
      expect(result.success).toBe(false);
      expect(result.error).toBe('CACHE_EXPIRED');
    });
  });

  describe('Semantic Similarity Search', () => {
    it('should find semantically similar queries', async () => {
      const originalQuery = 'Diabetes symptoms in elderly patients';
      const similarQueries = [
        'What are signs of diabetes in older adults?',
        'Common manifestations of diabetes in seniors',
        'Elderly patients with diabetes presentation',
      ];

      // Store original query
      const cacheEntry = generateValidCacheEntry();
      await semanticCacheService.store(
        { ...generateValidCacheQuery(), query: originalQuery },
        cacheEntry,
      );

      // Search for similar queries
      for (const similarQuery of similarQueries) {
        const result = await semanticCacheService.findSimilar(similarQuery, {
          threshold: 0.7,
          maxResults: 3,
        });

        expect(result.success).toBe(true);
        expect(result.matches).toHaveLength.greaterThan(0);
        expect(result.matches[0].similarityScore).toBe.greaterThanOrEqual(0.7);
      }
    });

    it('should respect similarity thresholds and result limits', async () => {
      const query = 'Specific medical query';
      const options = {
        threshold: 0.9,
        maxResults: 2,
      };

      const result = await semanticCacheService.findSimilar(query, options);

      expect(result.success).toBe(true);
      if (result.matches.length > 0) {
        expect(result.matches).toHaveLength.lessThanOrEqual(options.maxResults);
        result.matches.forEach(match => {
          expect(match.similarityScore).toBe.greaterThanOrEqual(options.threshold);
        });
      }
    });

    it('should handle healthcare context in similarity matching', async () => {
      const queryData = {
        ...generateValidCacheQuery(),
        context: {
          ...generateValidCacheQuery().context,
          department: 'cardiology',
          dataCategory: 'treatment' as const,
        },
      };

      const cacheEntry = generateValidCacheEntry();
      await semanticCacheService.store(queryData, cacheEntry);

      // Search with same healthcare context
      const result = await semanticCacheService.findSimilar(
        'Heart disease treatment options',
        {
          healthcareContext: {
            department: 'cardiology',
            dataCategory: 'treatment',
          },
        },
      );

      expect(result.success).toBe(true);
      expect(result.contextMatch).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should track and report performance metrics', async () => {
      const metrics = generateValidPerformanceMetrics();

      // Record metrics
      await semanticCacheService.recordPerformanceMetrics(metrics);

      // Verify metrics recording
      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalledWith(
        'cache_hit_rate',
        metrics.hitRate,
      );
      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalledWith(
        'cache_efficiency',
        metrics.cacheEfficiency,
      );

      // Retrieve metrics
      const retrievedMetrics = await semanticCacheService.getPerformanceMetrics();
      expect(retrievedMetrics.success).toBe(true);

      const parsedMetrics = CachePerformanceMetricsSchema.safeParse(retrievedMetrics.metrics);
      expect(parsedMetrics.success).toBe(true);
    });

    it('should optimize cache based on usage patterns', async () => {
      // Simulate cache usage patterns
      const frequentQueries = Array.from({ length: 10 }, (_, i) => generateValidCacheQuery());

      for (const query of frequentQueries) {
        await semanticCacheService.store(query, generateValidCacheEntry());
      }

      // Trigger optimization
      const optimizationResult = await semanticCacheService.optimizeCache();
      expect(optimizationResult.success).toBe(true);
      expect(optimizationResult.actionsTaken).toBeDefined();
    });

    it('should handle memory and storage constraints', async () => {
      // Set low memory limit for testing
      await semanticCacheService.setMemoryLimit(1048576); // 1MB

      // Try to store large entry
      const largeEntry = {
        ...generateValidCacheEntry(),
        response: {
          ...generateValidCacheEntry().response,
          content: 'x'.repeat(1024 * 1024), // 1MB content
        },
      };

      const result = await semanticCacheService.store(
        generateValidCacheQuery(),
        largeEntry,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('MEMORY_LIMIT_EXCEEDED');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate entries by pattern', async () => {
      const invalidationRequest = generateValidInvalidationRequest();

      // Store some entries
      const entries = Array.from({ length: 5 }, () => ({
        query: generateValidCacheQuery(),
        entry: generateValidCacheEntry(),
      }));

      for (const { query, entry } of entries) {
        await semanticCacheService.store(query, entry);
      }

      // Invalidate by pattern
      const result = await semanticCacheService.invalidate(invalidationRequest);
      expect(result.success).toBe(true);
      expect(result.invalidatedCount).toBe.greaterThan(0);

      // Verify entries are invalidated
      for (const { query } of entries) {
        const retrieveResult = await semanticCacheService.retrieve(query.query);
        expect(retrieveResult.success).toBe(false);
      }
    });

    it('should handle compliance-driven invalidation', async () => {
      const patientId = 'patient_789';

      // Store patient-specific entries
      const patientEntries = Array.from({ length: 3 }, () => ({
        query: {
          ...generateValidCacheQuery(),
          context: {
            ...generateValidCacheQuery().context,
            patientId,
          },
        },
        entry: generateValidCacheEntry(),
      }));

      for (const entry of patientEntries) {
        await semanticCacheService.store(entry.query, entry.entry);
      }

      // Trigger compliance invalidation
      const result = await semanticCacheService.invalidateByCompliance({
        type: 'LGPD_DATA_RETENTION',
        patientId,
        reason: 'Data retention policy expired',
      });

      expect(result.success).toBe(true);
      expect(result.complianceAction).toBe('LGPD_INVALIDATION');
    });

    it('should handle emergency data purging', async () => {
      const emergencyRequest = {
        pattern: '*',
        reason: 'compliance' as const,
        healthcareContext: {
          urgency: 'emergency' as const,
          dataCategory: 'diagnostic' as const,
        },
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          retentionPolicy: true,
        },
      };

      const result = await semanticCacheService.emergencyPurge(emergencyRequest);
      expect(result.success).toBe(true);
      expect(result.purgeReason).toBe('EMERGENCY_COMPLIANCE');

      // Verify audit trail for emergency action
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'EMERGENCY_CACHE_PURGE',
          severity: 'high',
        }),
      );
    });
  });

  describe('Healthcare Compliance Integration', () => {
    it('should validate all healthcare compliance frameworks', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      const result = await semanticCacheService.store(queryData, cacheEntry);

      expect(result.success).toBe(true);
      expect(result.complianceValidation).toBeDefined();
      expect(result.complianceValidation.lgpd.valid).toBe(true);
      expect(result.complianceValidation.anvisa.valid).toBe(true);
      expect(result.complianceValidation.cfm.valid).toBe(true);
    });

    it('should handle healthcare data anonymization', async () => {
      const sensitiveQuery = {
        ...generateValidCacheQuery(),
        context: {
          ...generateValidCacheQuery().context,
          patientId: 'patient_789',
          dataCategory: 'diagnostic' as const,
        },
      };

      const cacheEntry = generateValidCacheEntry();

      // Store sensitive data
      await semanticCacheService.store(sensitiveQuery, cacheEntry);

      // Request anonymization
      const anonymizationResult = await semanticCacheService.anonymizeData({
        patientId: 'patient_789',
        retainStatistics: true,
        preserveHealthcareContext: true,
      });

      expect(anonymizationResult.success).toBe(true);
      expect(anonymizationResult.anonymizedEntries).toBe.greaterThan(0);
    });

    it('should maintain audit trails for healthcare operations', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      await semanticCacheService.store(queryData, cacheEntry);

      // Verify audit trail creation
      expect(mockAuditService.logCacheOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'STORE',
          healthcareContext: queryData.context,
          complianceLevel: expect.any(String),
        }),
      );

      // Retrieve audit trail
      const auditTrail = await semanticCacheService.getAuditTrail({
        patientId: queryData.context.patientId,
        timeRange: { start: Date.now() - 3600000, end: Date.now() },
      });

      expect(auditTrail.success).toBe(true);
      expect(auditTrail.entries).toHaveLength.greaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle AI provider failures gracefully', async () => {
      mockAIProvider.generateResponse.mockRejectedValueOnce(
        new Error('AI Provider Unavailable'),
      );

      const queryData = generateValidCacheQuery();

      // Attempt cache miss scenario with failed AI provider
      const result = await semanticCacheService.retrieveOrGenerate(queryData.query);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI_PROVIDER_FAILURE');
      expect(result.fallbackAvailable).toBe(true);
    });

    it('should handle database connection failures', async () => {
      // Simulate database failure
      const dbError = new Error('Database connection failed');
      vi.spyOn(semanticCacheService, 'store').mockRejectedValueOnce(dbError);

      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      await expect(semanticCacheService.store(queryData, cacheEntry))
        .rejects.toThrow('DATABASE_FAILURE');

      // Verify fallback mechanisms
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'CACHE_DATABASE_FAILURE',
          severity: 'high',
        }),
      );
    });

    it('should handle concurrent access gracefully', async () => {
      const queryData = generateValidCacheQuery();
      const cacheEntry = generateValidCacheEntry();

      // Simulate concurrent access
      const concurrentOperations = Array.from(
        { length: 10 },
        () => semanticCacheService.store(queryData, cacheEntry),
      );

      const results = await Promise.allSettled(concurrentOperations);

      // Should handle concurrent access without corruption
      const successfulOps = results.filter(r => r.status === 'fulfilled');
      const failedOps = results.filter(r => r.status === 'rejected');

      expect(successfulOps.length).toBe.greaterThan(0);
      failedOps.forEach(op => {
        expect(op.reason).not.toContain('DATA_CORRUPTION');
      });
    });
  });

  describe('Integration with AI Provider Router', () => {
    it('should coordinate with AI provider for cache misses', async () => {
      const queryData = generateValidCacheQuery();

      // Clear cache to ensure miss
      await semanticCacheService.clear();

      const result = await semanticCacheService.retrieveOrGenerate(queryData.query);

      expect(result.success).toBe(true);
      expect(result.source).toBe('AI_PROVIDER');
      expect(result.cached).toBe(false);

      // Verify AI provider was called
      expect(mockAIProvider.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          query: queryData.query,
          healthcareContext: queryData.context,
        }),
      );
    });

    it('should optimize AI provider usage based on cache patterns', async () => {
      const optimizationResult = await semanticCacheService.optimizeAIProviderUsage();

      expect(optimizationResult.success).toBe(true);
      expect(optimizationResult.recommendations).toBeDefined();
      expect(optimizationResult.costSavings).toBeDefined();

      // Verify cost optimization metrics
      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalledWith(
        'ai_cost_optimization',
        expect.any(Number),
      );
    });

    it('should handle multi-provider caching strategies', async () => {
      const providers = ['openai', 'anthropic', 'cohere'];

      for (const provider of providers) {
        const queryData = {
          ...generateValidCacheQuery(),
          metadata: { preferredProvider: provider },
        };

        const result = await semanticCacheService.retrieveOrGenerate(queryData.query);
        expect(result.success).toBe(true);

        if (result.source === 'AI_PROVIDER') {
          expect(result.provider).toBe(provider);
        }
      }
    });
  });

  describe('Cache Statistics and Monitoring', () => {
    it('should provide comprehensive cache statistics', async () => {
      const stats = await semanticCacheService.getStatistics();

      expect(stats.success).toBe(true);
      expect(stats.statistics).toBeDefined();

      const parsedStats = CacheStatsSchema.safeParse(stats.statistics);
      expect(parsedStats.success).toBe(true);

      // Verify healthcare-specific breakdown
      expect(stats.statistics.healthcareBreakdown).toBeDefined();
      expect(stats.statistics.healthcareBreakdown.diagnosticQueries).toBeDefined();
      expect(stats.statistics.healthcareBreakdown.emergencyQueries).toBeDefined();
    });

    it('should monitor cache health and alert on issues', async () => {
      // Simulate poor cache performance
      await semanticCacheService.simulateHighLoad();

      const healthStatus = await semanticCacheService.getHealthStatus();

      expect(healthStatus.success).toBe(true);
      expect(healthStatus.overall).toBe('degraded');
      expect(healthStatus.issues).toHaveLength.greaterThan(0);

      // Verify alerting
      expect(mockPerformanceMonitor.alertOnThreshold).toHaveBeenCalled();
    });

    it('should provide performance insights and recommendations', async () => {
      const insights = await semanticCacheService.getPerformanceInsights();

      expect(insights.success).toBe(true);
      expect(insights.insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();

      // Verify healthcare-specific insights
      const healthcareInsights = insights.insights.filter(
        insight => insight.category === 'healthcare',
      );
      expect(healthcareInsights.length).toBe.greaterThan(0);
    });
  });

  describe('Data Retention and Cleanup', () => {
    it('should enforce data retention policies', async () => {
      const retentionPolicies = {
        diagnostic: 86400000, // 24 hours
        treatment: 604800000, // 7 days
        administrative: 2592000000, // 30 days
        research: 31536000000, // 1 year
      };

      for (const [category, retention] of Object.entries(retentionPolicies)) {
        const result = await semanticCacheService.cleanupExpiredData({
          dataCategory: category as any,
          retentionPeriod: retention,
        });

        expect(result.success).toBe(true);
        expect(result.cleanedEntries).toBeDefined();
      }
    });

    it('should handle automated cleanup scheduling', async () => {
      const scheduleResult = await semanticCacheService.scheduleCleanup({
        frequency: 'daily',
        time: '02:00',
        timezone: 'UTC',
        healthcareData: true,
      });

      expect(scheduleResult.success).toBe(true);
      expect(scheduleResult.nextRun).toBeDefined();
      expect(scheduleResult.configuredJobs).toHaveLength.greaterThan(0);
    });

    it('should provide cleanup reports and metrics', async () => {
      const report = await semanticCacheService.getCleanupReport({
        timeRange: { start: Date.now() - 86400000, end: Date.now() },
        includeHealthcareMetrics: true,
      });

      expect(report.success).toBe(true);
      expect(report.summary).toBeDefined();
      expect(report.healthcareCompliance).toBeDefined();
      expect(report.dataRetentionMetrics).toBeDefined();
    });
  });
});
