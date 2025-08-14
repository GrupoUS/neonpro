/**
 * Vision Analysis API Tests
 * 
 * Comprehensive test suite for the vision analysis API endpoints.
 * Tests POST, GET, PUT, and DELETE operations with various scenarios.
 */

import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/vision/analysis/route';
import { createClient } from '@/lib/supabase/server';
import { VisionAnalysisEngine } from '@/lib/vision/analysis-engine';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/vision/analysis-engine');
jest.mock('@/lib/monitoring/error-tracking');

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }))
};

const mockVisionEngine = {
  analyzeBeforeAfter: jest.fn(),
  saveAnalysisResult: jest.fn()
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);
(VisionAnalysisEngine as jest.Mock).mockImplementation(() => mockVisionEngine);

describe('/api/vision/analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  describe('POST /api/vision/analysis', () => {
    it('should create new analysis successfully', async () => {
      const mockAnalysisResult = {
        id: 'analysis-123',
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        accuracyScore: 0.96,
        processingTime: 15000,
        improvementPercentage: 25.5,
        changeMetrics: {
          overallImprovement: 25.5,
          textureImprovement: 30.2,
          colorImprovement: 20.8,
          clarityImprovement: 28.1,
          symmetryImprovement: 22.3
        },
        annotations: []
      };

      mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
      mockSupabase.from().insert.mockResolvedValue({ data: mockAnalysisResult, error: null });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-image-data',
          afterImage: 'base64-image-data'
        }
      });

      await handler.POST(req as any);

      expect(mockVisionEngine.analyzeBeforeAfter).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('vision_analyses');
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456'
          // Missing required fields
        }
      });

      const response = await handler.POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized')
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-image-data',
          afterImage: 'base64-image-data'
        }
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(401);
    });

    it('should handle analysis engine errors', async () => {
      mockVisionEngine.analyzeBeforeAfter.mockRejectedValue(new Error('Analysis failed'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-image-data',
          afterImage: 'base64-image-data'
        }
      });

      const response = await handler.POST(req as any);

      expect(response.status).toBe(500);
    });

    it('should check accuracy and time requirements', async () => {
      const mockAnalysisResult = {
        id: 'analysis-123',
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        accuracyScore: 0.96, // Above 0.85 threshold
        processingTime: 15000, // Below 30000ms threshold
        improvementPercentage: 25.5,
        changeMetrics: {},
        annotations: []
      };

      mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
      mockSupabase.from().insert.mockResolvedValue({ data: mockAnalysisResult, error: null });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-image-data',
          afterImage: 'base64-image-data'
        }
      });

      const response = await handler.POST(req as any);
      const data = await response.json();

      expect(data.meetsAccuracyTarget).toBe(true);
      expect(data.meetsProcessingTimeTarget).toBe(true);
    });
  });

  describe('GET /api/vision/analysis', () => {
    it('should retrieve analysis history for patient', async () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          patient_id: 'patient-456',
          accuracy_score: 0.95,
          processing_time: 12000,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'analysis-2',
          patient_id: 'patient-456',
          accuracy_score: 0.92,
          processing_time: 18000,
          created_at: '2024-01-02T00:00:00Z'
        }
      ];

      mockSupabase.from().select.mockResolvedValue({ data: mockAnalyses, error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: { patientId: 'patient-456' }
      });

      const response = await handler.GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analyses).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('vision_analyses');
    });

    it('should handle pagination', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          patientId: 'patient-456',
          page: '2',
          limit: '10'
        }
      });

      mockSupabase.from().select.mockReturnValue({
        range: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await handler.GET(req as any);

      expect(mockSupabase.from().select().range).toHaveBeenCalledWith(10, 19);
    });
  });

  describe('PUT /api/vision/analysis', () => {
    it('should update analysis record', async () => {
      const updateData = {
        notes: 'Updated analysis notes',
        qualityRating: 5,
        reviewStatus: 'approved'
      };

      mockSupabase.from().update.mockResolvedValue({ data: updateData, error: null });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'analysis-123' },
        body: updateData
      });

      const response = await handler.PUT(req as any);

      expect(response.status).toBe(200);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updateData);
    });

    it('should validate analysis ID', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: {}, // Missing ID
        body: { notes: 'Test notes' }
      });

      const response = await handler.PUT(req as any);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/vision/analysis', () => {
    it('should soft delete analysis record', async () => {
      mockSupabase.from().update.mockResolvedValue({ data: null, error: null });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'analysis-123' }
      });

      const response = await handler.DELETE(req as any);

      expect(response.status).toBe(200);
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        deleted_at: expect.any(String),
        is_active: false
      });
    });

    it('should validate analysis ID for deletion', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {} // Missing ID
      });

      const response = await handler.DELETE(req as any);

      expect(response.status).toBe(400);
    });
  });

  describe('Performance Requirements', () => {
    it('should log performance metrics', async () => {
      const mockAnalysisResult = {
        id: 'analysis-123',
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        accuracyScore: 0.96,
        processingTime: 15000,
        improvementPercentage: 25.5,
        changeMetrics: {},
        annotations: []
      };

      mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
      mockSupabase.from().insert.mockResolvedValue({ data: mockAnalysisResult, error: null });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-image-data',
          afterImage: 'base64-image-data'
        }
      });

      const response = await handler.POST(req as any);
      const data = await response.json();

      // Verify performance metrics are included
      expect(data.performance).toBeDefined();
      expect(data.performance.accuracyScore).toBe(0.96);
      expect(data.performance.processingTime).toBe(15000);
    });
  });
});