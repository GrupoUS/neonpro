/**
 * Vision Performance API Tests
 * 
 * Test suite for the vision analysis performance monitoring API endpoints.
 * Tests GET and POST operations for performance metrics and monitoring.
 */

import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/vision/performance/route';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/monitoring/error-tracking');

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    order: jest.fn()
  })),
  rpc: jest.fn()
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('/api/vision/performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  describe('GET /api/vision/performance', () => {
    it('should retrieve aggregated performance metrics', async () => {
      const mockMetrics = {
        totalAnalyses: 150,
        averageAccuracy: 0.94,
        averageProcessingTime: 18500,
        averageConfidence: 0.91,
        accuracyTargetCompliance: 0.87,
        processingTimeTargetCompliance: 0.92
      };

      mockSupabase.rpc.mockResolvedValue({ data: [mockMetrics], error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeRange: '30d',
          groupBy: 'day'
        }
      });

      const response = await handler.GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.totalAnalyses).toBe(150);
      expect(data.metrics.averageAccuracy).toBe(0.94);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_vision_performance_metrics',
        expect.objectContaining({
          user_id: 'test-user-id',
          time_range: '30d',
          group_by: 'day'
        })
      );
    });

    it('should handle time series data request', async () => {
      const mockTimeSeriesData = [
        {
          date: '2024-01-01',
          totalAnalyses: 10,
          averageAccuracy: 0.95,
          averageProcessingTime: 15000
        },
        {
          date: '2024-01-02',
          totalAnalyses: 12,
          averageAccuracy: 0.93,
          averageProcessingTime: 17000
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockTimeSeriesData, error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeRange: '7d',
          groupBy: 'day',
          includeTimeSeries: 'true'
        }
      });

      const response = await handler.GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timeSeries).toBeDefined();
      expect(data.timeSeries).toHaveLength(2);
    });

    it('should validate time range parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeRange: 'invalid-range'
        }
      });

      const response = await handler.GET(req as any);

      expect(response.status).toBe(400);
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized')
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { timeRange: '7d' }
      });

      const response = await handler.GET(req as any);

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { timeRange: '7d' }
      });

      const response = await handler.GET(req as any);

      expect(response.status).toBe(500);
    });

    it('should apply default parameters when not provided', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: {} // No parameters
      });

      await handler.GET(req as any);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_vision_performance_metrics',
        expect.objectContaining({
          time_range: '7d', // Default
          group_by: 'day' // Default
        })
      );
    });
  });

  describe('POST /api/vision/performance', () => {
    it('should record performance metrics successfully', async () => {
      const performanceData = {
        analysisId: 'analysis-123',
        processingTime: 15000,
        accuracyScore: 0.96,
        confidenceScore: 0.94,
        memoryUsage: 512,
        errorCount: 0,
        metadata: {
          modelVersion: '2.1.0',
          imageSize: '1024x768',
          processingSteps: 5
        }
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: [{ id: 'perf-123', ...performanceData }],
        error: null
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: performanceData
      });

      const response = await handler.POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('vision_performance_metrics');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          analysis_id: 'analysis-123',
          processing_time: 15000,
          accuracy_score: 0.96,
          confidence_score: 0.94,
          memory_usage: 512,
          error_count: 0,
          user_id: 'test-user-id'
        })
      );
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          analysisId: 'analysis-123'
          // Missing required fields
        }
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(400);
    });

    it('should validate numeric ranges', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          analysisId: 'analysis-123',
          processingTime: 15000,
          accuracyScore: 1.5, // Invalid: > 1.0
          confidenceScore: 0.94
        }
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(400);
    });

    it('should handle database insertion errors', async () => {
      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: new Error('Insertion failed')
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          analysisId: 'analysis-123',
          processingTime: 15000,
          accuracyScore: 0.96,
          confidenceScore: 0.94
        }
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(500);
    });

    it('should include performance thresholds in response', async () => {
      const performanceData = {
        analysisId: 'analysis-123',
        processingTime: 15000,
        accuracyScore: 0.96,
        confidenceScore: 0.94
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: [{ id: 'perf-123', ...performanceData }],
        error: null
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: performanceData
      });

      const response = await handler.POST(req as any);
      const data = await response.json();

      expect(data.meetsAccuracyTarget).toBe(true); // 0.96 > 0.85
      expect(data.meetsProcessingTimeTarget).toBe(true); // 15000 < 30000
    });

    it('should handle optional metadata', async () => {
      const performanceData = {
        analysisId: 'analysis-123',
        processingTime: 15000,
        accuracyScore: 0.96,
        confidenceScore: 0.94,
        metadata: {
          customField: 'customValue',
          nestedObject: {
            key: 'value'
          }
        }
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: [{ id: 'perf-123', ...performanceData }],
        error: null
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: performanceData
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(201);
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: performanceData.metadata
        })
      );
    });
  });

  describe('Performance Thresholds', () => {
    it('should correctly identify when targets are met', async () => {
      const testCases = [
        {
          accuracy: 0.90,
          time: 20000,
          expectedAccuracy: true,
          expectedTime: true
        },
        {
          accuracy: 0.80,
          time: 35000,
          expectedAccuracy: false,
          expectedTime: false
        },
        {
          accuracy: 0.95,
          time: 35000,
          expectedAccuracy: true,
          expectedTime: false
        }
      ];

      for (const testCase of testCases) {
        mockSupabase.from().insert.mockResolvedValue({
          data: [{ id: 'perf-test' }],
          error: null
        });

        const { req, res } = createMocks({
          method: 'POST',
          body: {
            analysisId: 'analysis-test',
            processingTime: testCase.time,
            accuracyScore: testCase.accuracy,
            confidenceScore: 0.90
          }
        });

        const response = await handler.POST(req as any);
        const data = await response.json();

        expect(data.meetsAccuracyTarget).toBe(testCase.expectedAccuracy);
        expect(data.meetsProcessingTimeTarget).toBe(testCase.expectedTime);
      }
    });
  });
});