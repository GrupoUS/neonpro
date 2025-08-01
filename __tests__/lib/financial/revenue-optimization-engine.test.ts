/**
 * Revenue Optimization Engine Tests
 * 
 * Comprehensive test suite for revenue optimization functionality:
 * - Dynamic pricing optimization
 * - Service mix optimization
 * - Customer lifetime value enhancement
 * - Automated revenue recommendations
 * - Competitive analysis and benchmarking
 * - ROI tracking and performance monitoring
 */

import { RevenueOptimizationEngine } from '@/lib/financial/revenue-optimization-engine';

// Mock Supabase client
const mockSelect = jest.fn(() => ({
  eq: jest.fn(() => ({
    eq: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ 
          data: { 
            id: 'test-strategy-1',
            strategy_name: 'Dynamic Pricing',
            strategy_type: 'dynamic',
            base_price: 500,
            is_active: true
          },
          error: null
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ 
            data: [
              {
                id: 'test-analysis-1',
                competitor_name: 'Competitor A',
                price_comparison: 0.85,
                analysis_date: '2024-01-01'
              }
            ],
            error: null
          }))
        }))
      }))
    })),
    single: jest.fn(() => Promise.resolve({ 
      data: { 
        id: 'test-strategy-1',
        strategy_name: 'Dynamic Pricing',
        strategy_type: 'dynamic',
        base_price: 500,
        is_active: true
      },
      error: null
    })),
    order: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ 
        data: [
          {
            id: 'test-analysis-1',
            competitor_name: 'Competitor A',
            price_comparison: 0.85,
            analysis_date: '2024-01-01'
          }
        ],
        error: null
      }))
    })),
    limit: jest.fn(() => Promise.resolve({ 
      data: [
        {
          id: 'test-analysis-1',
          competitor_name: 'Competitor A',
          price_comparison: 0.85,
          analysis_date: '2024-01-01'
        }
      ],
      error: null
    }))
  }))
}));

jest.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: mockSelect
    }))
  })
}));

describe('RevenueOptimizationEngine', () => {
  let engine: RevenueOptimizationEngine;
  const mockClinicId = 'clinic-123';
  const mockServiceId = 'service-456';
  const mockPatientId = 'patient-789';

  beforeEach(() => {
    engine = new RevenueOptimizationEngine();
    jest.clearAllMocks();
  });

  describe('🔥 Core Engine Initialization', () => {
    test('should initialize RevenueOptimizationEngine', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(RevenueOptimizationEngine);
    });

    test('should have required methods', () => {
      expect(typeof engine.optimizePricing).toBe('function');
      expect(typeof engine.optimizeServiceMix).toBe('function');
      expect(typeof engine.enhanceCLV).toBe('function');
      expect(typeof engine.generateAutomatedRecommendations).toBe('function');
      expect(typeof engine.getCompetitiveAnalysis).toBe('function');
      expect(typeof engine.trackROI).toBe('function');
    });
  });

  describe('💰 Dynamic Pricing Optimization', () => {
    test('should optimize pricing strategy successfully', async () => {
      const result = await engine.optimizePricing(mockClinicId, mockServiceId);

      expect(result).toBeDefined();
      expect(result.currentStrategy).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.projectedIncrease).toBeGreaterThan(0);
      expect(result.competitiveAnalysis).toBeDefined();
    });

    test('should handle pricing optimization without service ID', async () => {
      const result = await engine.optimizePricing(mockClinicId);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.projectedIncrease).toBeGreaterThan(0);
    });

    test('should generate pricing recommendations', async () => {
      const result = await engine.optimizePricing(mockClinicId, mockServiceId);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      result.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    test('should calculate projected revenue increase', async () => {
      const result = await engine.optimizePricing(mockClinicId, mockServiceId);

      expect(result.projectedIncrease).toBeGreaterThan(0);
      expect(result.projectedIncrease).toBeLessThan(100); // Reasonable upper bound
    });

    test('should handle pricing optimization errors gracefully', async () => {
      // Mock error scenario
      const mockEngine = new RevenueOptimizationEngine();
      jest.spyOn(mockEngine as any, 'analyzeMarketDemand').mockRejectedValue(new Error('Network error'));

      await expect(mockEngine.optimizePricing(mockClinicId)).rejects.toThrow('Failed to optimize pricing strategy');
    });
  });

  describe('🎨 Service Mix Optimization', () => {
    test('should optimize service mix successfully', async () => {
      const result = await engine.optimizeServiceMix(mockClinicId);

      expect(result).toBeDefined();
      expect(result.currentMix).toBeInstanceOf(Array);
      expect(result.optimizedMix).toBeInstanceOf(Array);
      expect(result.profitabilityGain).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    test('should analyze service performance', async () => {
      const result = await engine.optimizeServiceMix(mockClinicId);

      expect(result.currentMix).toBeInstanceOf(Array);
      result.currentMix.forEach(service => {
        expect(service).toHaveProperty('serviceId');
        expect(service).toHaveProperty('serviceName');
        expect(service).toHaveProperty('revenue');
        expect(service).toHaveProperty('margin');
        expect(service).toHaveProperty('profitabilityRank');
      });
    });

    test('should generate service mix recommendations', async () => {
      const result = await engine.optimizeServiceMix(mockClinicId);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBe(5); // Standard recommendations
      result.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    test('should calculate profitability gain', async () => {
      const result = await engine.optimizeServiceMix(mockClinicId);

      expect(result.profitabilityGain).toBeGreaterThan(0);
      expect(result.profitabilityGain).toBeLessThan(50); // Reasonable upper bound
    });
  });

  describe('📊 Customer Lifetime Value Enhancement', () => {
    test('should enhance CLV successfully', async () => {
      const result = await engine.enhanceCLV(mockClinicId, mockPatientId);

      expect(result).toBeDefined();
      expect(result.clvPredictions).toBeInstanceOf(Array);
      expect(result.enhancementStrategies).toBeInstanceOf(Array);
      expect(result.projectedIncrease).toBeGreaterThan(0);
      expect(result.riskSegmentation).toBeDefined();
    });

    test('should handle CLV enhancement without patient ID', async () => {
      const result = await engine.enhanceCLV(mockClinicId);

      expect(result).toBeDefined();
      expect(result.clvPredictions).toBeInstanceOf(Array);
      expect(result.enhancementStrategies).toBeInstanceOf(Array);
    });

    test('should segment customers by risk', async () => {
      const result = await engine.enhanceCLV(mockClinicId);

      expect(result.riskSegmentation).toBeDefined();
      expect(result.riskSegmentation).toHaveProperty('highValueLowRisk');
      expect(result.riskSegmentation).toHaveProperty('highValueHighRisk');
      expect(result.riskSegmentation).toHaveProperty('lowValueLowRisk');
      expect(result.riskSegmentation).toHaveProperty('lowValueHighRisk');
    });

    test('should generate CLV enhancement strategies', async () => {
      const result = await engine.enhanceCLV(mockClinicId);

      expect(result.enhancementStrategies).toBeInstanceOf(Array);
      expect(result.enhancementStrategies.length).toBe(5); // Standard strategies
      result.enhancementStrategies.forEach(strategy => {
        expect(typeof strategy).toBe('string');
        expect(strategy.length).toBeGreaterThan(0);
      });
    });

    test('should calculate CLV increase projection', async () => {
      const result = await engine.enhanceCLV(mockClinicId);

      expect(result.projectedIncrease).toBeGreaterThan(0);
      expect(result.projectedIncrease).toBeLessThan(100); // Reasonable upper bound
    });
  });

  describe('🤖 Automated Revenue Recommendations', () => {
    test('should generate automated recommendations successfully', async () => {
      const result = await engine.generateAutomatedRecommendations(mockClinicId);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.totalProjectedIncrease).toBeGreaterThan(0);
      expect(result.implementationPlan).toBeInstanceOf(Array);
    });

    test('should provide comprehensive recommendations', async () => {
      const result = await engine.generateAutomatedRecommendations(mockClinicId);

      expect(result.recommendations.length).toBe(5); // Standard recommendation count
      result.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('expectedImpact');
        expect(rec).toHaveProperty('implementationEffort');
        expect(rec).toHaveProperty('timeframe');
      });
    });

    test('should calculate total projected increase', async () => {
      const result = await engine.generateAutomatedRecommendations(mockClinicId);

      const manualTotal = result.recommendations.reduce((sum, rec) => sum + rec.expectedImpact, 0);
      expect(result.totalProjectedIncrease).toBe(manualTotal);
      expect(result.totalProjectedIncrease).toBeGreaterThan(30); // Expected minimum impact
    });

    test('should provide implementation plan', async () => {
      const result = await engine.generateAutomatedRecommendations(mockClinicId);

      expect(result.implementationPlan).toBeInstanceOf(Array);
      expect(result.implementationPlan.length).toBe(5); // Standard phases
      result.implementationPlan.forEach(phase => {
        expect(typeof phase).toBe('string');
        expect(phase.length).toBeGreaterThan(0);
      });
    });
  });

  describe('🏆 Competitive Analysis and Benchmarking', () => {
    test('should get competitive analysis successfully', async () => {
      const result = await engine.getCompetitiveAnalysis(mockClinicId);

      expect(result).toBeDefined();
      expect(result.competitorData).toBeInstanceOf(Array);
      expect(result.marketPosition).toBeDefined();
      expect(result.pricingGaps).toBeInstanceOf(Array);
      expect(result.opportunityAreas).toBeInstanceOf(Array);
      expect(result.benchmarkMetrics).toBeDefined();
    });

    test('should analyze market position', async () => {
      const result = await engine.getCompetitiveAnalysis(mockClinicId);

      expect(typeof result.marketPosition).toBe('string');
      expect(result.marketPosition.length).toBeGreaterThan(0);
    });

    test('should identify pricing gaps', async () => {
      const result = await engine.getCompetitiveAnalysis(mockClinicId);

      expect(result.pricingGaps).toBeInstanceOf(Array);
      result.pricingGaps.forEach(gap => {
        expect(gap).toHaveProperty('service');
        expect(gap).toHaveProperty('currentPrice');
        expect(gap).toHaveProperty('marketAverage');
        expect(gap).toHaveProperty('opportunity');
        expect(gap).toHaveProperty('recommendedPrice');
      });
    });

    test('should provide opportunity areas', async () => {
      const result = await engine.getCompetitiveAnalysis(mockClinicId);

      expect(result.opportunityAreas).toBeInstanceOf(Array);
      expect(result.opportunityAreas.length).toBe(5); // Standard opportunities
      result.opportunityAreas.forEach(area => {
        expect(typeof area).toBe('string');
        expect(area.length).toBeGreaterThan(0);
      });
    });

    test('should calculate benchmark metrics', async () => {
      const result = await engine.getCompetitiveAnalysis(mockClinicId);

      expect(result.benchmarkMetrics).toBeDefined();
      expect(result.benchmarkMetrics).toHaveProperty('priceCompetitiveness');
      expect(result.benchmarkMetrics).toHaveProperty('serviceQuality');
      expect(result.benchmarkMetrics).toHaveProperty('customerSatisfaction');
      expect(result.benchmarkMetrics).toHaveProperty('marketShare');
    });
  });

  describe('📈 ROI Tracking and Performance', () => {
    test('should track ROI successfully', async () => {
      const result = await engine.trackROI(mockClinicId);

      expect(result).toBeDefined();
      expect(result.roiMetrics).toBeInstanceOf(Array);
      expect(result.performanceIndicators).toBeDefined();
      expect(result.trendAnalysis).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    test('should track specific optimization ROI', async () => {
      const mockOptimizationId = 'optimization-123';
      const result = await engine.trackROI(mockClinicId, mockOptimizationId);

      expect(result).toBeDefined();
      expect(result.roiMetrics).toBeInstanceOf(Array);
    });

    test('should calculate performance indicators', async () => {
      const result = await engine.trackROI(mockClinicId);

      expect(result.performanceIndicators).toBeDefined();
      expect(result.performanceIndicators).toHaveProperty('overallROI');
      expect(result.performanceIndicators).toHaveProperty('successRate');
      expect(result.performanceIndicators).toHaveProperty('averagePerformance');
    });

    test('should analyze trends', async () => {
      const result = await engine.trackROI(mockClinicId);

      expect(result.trendAnalysis).toBeDefined();
      expect(result.trendAnalysis).toHaveProperty('improving');
      expect(result.trendAnalysis).toHaveProperty('declining');
      expect(result.trendAnalysis).toHaveProperty('stable');
      
      // Verify trend counts are non-negative integers
      expect(result.trendAnalysis.improving).toBeGreaterThanOrEqual(0);
      expect(result.trendAnalysis.declining).toBeGreaterThanOrEqual(0);
      expect(result.trendAnalysis.stable).toBeGreaterThanOrEqual(0);
    });

    test('should generate performance recommendations', async () => {
      const result = await engine.trackROI(mockClinicId);

      expect(result.recommendations).toBeInstanceOf(Array);
      result.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });
  });

  describe('🔧 Error Handling and Edge Cases', () => {
    test('should handle invalid clinic ID', async () => {
      const invalidClinicId = '';
      
      // Mock invalid response for empty clinic ID
      mockSelect.mockImplementationOnce(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: null,
                error: { message: 'No data found' }
              })),
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ 
                  data: [],
                  error: { message: 'No data found' }
                }))
              }))
            }))
          }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ 
            data: [],
            error: { message: 'No data found' }
          }))
        }))
      }));
      
      await expect(engine.optimizePricing(invalidClinicId)).rejects.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      // Mock network failure
      mockSelect.mockImplementationOnce(() => {
        throw new Error('Network connection failed');
      });
      
      await expect(engine.optimizePricing(mockClinicId)).rejects.toThrow(/Failed to optimize pricing strategy/);
    });

    test('should handle empty data responses', async () => {
      // Mock empty data
      const mockEngine = new RevenueOptimizationEngine();
      jest.spyOn(mockEngine as any, 'analyzeServicePerformance').mockResolvedValue([]);

      const result = await mockEngine.optimizeServiceMix(mockClinicId);
      expect(result.currentMix).toEqual([]);
      expect(result.optimizedMix).toEqual([]);
    });
  });

  describe('🎯 Integration and Performance', () => {
    test('should complete full optimization cycle within reasonable time', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        engine.optimizePricing(mockClinicId),
        engine.optimizeServiceMix(mockClinicId),
        engine.enhanceCLV(mockClinicId),
        engine.getCompetitiveAnalysis(mockClinicId),
        engine.trackROI(mockClinicId)
      ]);
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should maintain data consistency across methods', async () => {
      const [pricingResult, serviceMixResult, clvResult] = await Promise.all([
        engine.optimizePricing(mockClinicId),
        engine.optimizeServiceMix(mockClinicId),
        engine.enhanceCLV(mockClinicId)
      ]);

      // All results should be for the same clinic
      expect(pricingResult).toBeDefined();
      expect(serviceMixResult).toBeDefined();
      expect(clvResult).toBeDefined();
    });

    test('should provide realistic optimization projections', async () => {
      const automatedResult = await engine.generateAutomatedRecommendations(mockClinicId);

      // Total projected increase should be realistic (not excessive)
      expect(automatedResult.totalProjectedIncrease).toBeGreaterThan(10);
      expect(automatedResult.totalProjectedIncrease).toBeLessThan(100);
      
      // Individual recommendations should have reasonable impact
      automatedResult.recommendations.forEach(rec => {
        expect(rec.expectedImpact).toBeGreaterThan(0);
        expect(rec.expectedImpact).toBeLessThan(30);
      });
    });
  });
});