/**
 * useVisionAnalysis Hook Tests
 * 
 * Test suite for the useVisionAnalysis custom React hook
 * that manages computer vision analysis operations.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(() => 'toast-id'),
    dismiss: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for download
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
  style: {}
};

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any;
  }
  return document.createElement(tagName);
});

jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchorElement as any);
jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchorElement as any);

const mockAnalysisResult = {
  id: 'analysis-123',
  patientId: 'patient-456',
  treatmentId: 'treatment-789',
  beforeImageUrl: '/images/before.jpg',
  afterImageUrl: '/images/after.jpg',
  accuracyScore: 0.96,
  confidenceScore: 0.94,
  processingTime: 15000,
  improvementPercentage: 25.5,
  changeMetrics: {
    overallImprovement: 25.5,
    textureImprovement: 30.2,
    colorImprovement: 20.8,
    clarityImprovement: 28.1,
    symmetryImprovement: 22.3
  },
  annotations: [],
  metadata: {
    modelVersion: '2.1.0',
    analysisDate: '2024-01-15T10:30:00Z'
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

describe('useVisionAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVisionAnalysis());

    expect(result.current.currentAnalysis).toBeNull();
    expect(result.current.analysisHistory).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.isSharing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.performanceMetrics).toEqual({
      averageAccuracy: 0,
      averageProcessingTime: 0,
      successRate: 0,
      totalAnalyses: 0
    });
  });

  describe('startAnalysis', () => {
    it('should start analysis successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: mockAnalysisResult,
          performance: {
            accuracyScore: 0.96,
            processingTime: 15000
          }
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.startAnalysis({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.currentAnalysis).toEqual(mockAnalysisResult);
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(toast.success).toHaveBeenCalledWith('Analysis completed successfully!');
    });

    it('should validate input parameters', async () => {
      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.startAnalysis({
          patientId: '',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.error).toBe('Patient ID is required');
      expect(toast.error).toHaveBeenCalledWith('Patient ID is required');
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Analysis failed'
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.startAnalysis({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.error).toBe('Analysis failed');
      expect(result.current.isAnalyzing).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Analysis failed');
    });

    it('should simulate progress during analysis', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              success: true,
              analysis: mockAnalysisResult
            })
          }), 100)
        )
      );

      const { result } = renderHook(() => useVisionAnalysis());

      act(() => {
        result.current.startAnalysis({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.isAnalyzing).toBe(true);
      expect(result.current.progress).toBeGreaterThan(0);

      await waitFor(() => {
        expect(result.current.isAnalyzing).toBe(false);
      });
    });
  });

  describe('loadAnalysisHistory', () => {
    it('should load analysis history successfully', async () => {
      const mockHistory = [mockAnalysisResult];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analyses: mockHistory,
          total: 1
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.loadAnalysisHistory('patient-456');
      });

      expect(result.current.analysisHistory).toEqual(mockHistory);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.loadAnalysisHistory('patient-456');
      });

      expect(result.current.error).toBe('Failed to load analysis history');
      expect(toast.error).toHaveBeenCalledWith('Failed to load analysis history');
    });
  });

  describe('exportAnalysis', () => {
    it('should export analysis as PDF successfully', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: (name: string) => {
            if (name === 'content-disposition') {
              return 'attachment; filename="analysis-report.pdf"';
            }
            return null;
          }
        }
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.exportAnalysis('analysis-123', {
          format: 'pdf',
          includeImages: true,
          includeAnnotations: true
        });
      });

      expect(result.current.isExporting).toBe(false);
      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Analysis exported successfully!');
    });

    it('should handle export errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Export failed'
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.exportAnalysis('analysis-123', {
          format: 'pdf'
        });
      });

      expect(result.current.error).toBe('Export failed');
      expect(toast.error).toHaveBeenCalledWith('Export failed');
    });
  });

  describe('shareAnalysis', () => {
    it('should share analysis successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          shareUrl: 'https://app.com/share/abc123',
          shareId: 'share-123'
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.shareAnalysis('analysis-123', {
          shareType: 'professional',
          expiresIn: '7d',
          includeImages: true
        });
      });

      expect(result.current.isSharing).toBe(false);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://app.com/share/abc123');
      expect(toast.success).toHaveBeenCalledWith('Share link copied to clipboard!');
    });

    it('should handle share errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Share failed'
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.shareAnalysis('analysis-123', {
          shareType: 'public'
        });
      });

      expect(result.current.error).toBe('Share failed');
      expect(toast.error).toHaveBeenCalledWith('Share failed');
    });
  });

  describe('utility functions', () => {
    it('should clear current analysis', () => {
      const { result } = renderHook(() => useVisionAnalysis());

      // Set some analysis first
      act(() => {
        result.current.currentAnalysis = mockAnalysisResult;
      });

      act(() => {
        result.current.clearCurrentAnalysis();
      });

      expect(result.current.currentAnalysis).toBeNull();
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useVisionAnalysis());

      // Set an error first
      act(() => {
        result.current.error = 'Test error';
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('performance metrics', () => {
    it('should update performance metrics after successful analysis', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: mockAnalysisResult,
          performance: {
            accuracyScore: 0.96,
            processingTime: 15000
          }
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.startAnalysis({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.performanceMetrics.totalAnalyses).toBe(1);
      expect(result.current.performanceMetrics.averageAccuracy).toBe(0.96);
      expect(result.current.performanceMetrics.averageProcessingTime).toBe(15000);
      expect(result.current.performanceMetrics.successRate).toBe(1);
    });

    it('should handle failed analyses in performance metrics', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Analysis failed'
        })
      });

      const { result } = renderHook(() => useVisionAnalysis());

      await act(async () => {
        await result.current.startAnalysis({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        });
      });

      expect(result.current.performanceMetrics.totalAnalyses).toBe(1);
      expect(result.current.performanceMetrics.successRate).toBe(0);
    });
  });
});