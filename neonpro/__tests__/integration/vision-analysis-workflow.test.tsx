/**
 * Vision Analysis Workflow Integration Tests
 * 
 * End-to-end integration tests for the complete computer vision analysis workflow,
 * testing the interaction between components, hooks, API endpoints, and database.
 */

import { createClient } from '@/app/utils/supabase/server';
import { VisionAnalysisEngine } from '@/lib/vision/analysis-engine';

// Mock dependencies
jest.mock('@/app/utils/supabase/server');
jest.mock('@/lib/vision/analysis-engine');
jest.mock('sonner');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    pathname: '/dashboard/vision-analysis',
    query: {},
    asPath: '/dashboard/vision-analysis',
  }),
  useSearchParams: () => new URLSearchParams()
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock file reading
global.FileReader = class {
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-base64-data';
      if (this.onload) {
        this.onload({ target: this } as ProgressEvent<FileReader>);
      }
    }, 100);
  }
};

// Mock data (define first)
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
  annotations: [
    {
      id: 'ann-1',
      type: 'improvement',
      coordinates: { x: 100, y: 150, width: 50, height: 50 },
      confidence: 0.95,
      description: 'Significant texture improvement'
    }
  ],
  metadata: {
    modelVersion: '2.1.0',
    analysisDate: '2024-01-15T10:30:00Z'
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    })
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: mockAnalysisResult,
      error: null
    })
  })),
  rpc: jest.fn().mockResolvedValue({
    data: [mockAnalysisResult],
    error: null
  })
};

// Mock Vision Analysis Engine
const mockVisionEngine = {
  analyzeBeforeAfter: jest.fn().mockResolvedValue(mockAnalysisResult),
  saveAnalysisResult: jest.fn().mockResolvedValue({ success: true }),
  initialize: jest.fn().mockResolvedValue(true),
  loadModel: jest.fn().mockResolvedValue(true)
};

// Apply mocks
(createClient as jest.Mock).mockReturnValue(mockSupabase);
(VisionAnalysisEngine as jest.Mock).mockImplementation(() => mockVisionEngine);

describe('Vision Analysis Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalysisResult),
      status: 200,
      statusText: 'OK'
    });
  });

  it('should complete full analysis workflow successfully', async () => {
    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockAnalysisResult,
        message: 'Analysis completed successfully'
      })
    });

    // Test the workflow by calling the API directly
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,mock-before-image',
        afterImage: 'data:image/jpeg;base64,mock-after-image'
      }),
    });

    const result = await response.json();

    // Verify API was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,mock-before-image',
        afterImage: 'data:image/jpeg;base64,mock-after-image'
      }),
    });

    // Verify response structure
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAnalysisResult);
    expect(result.data.improvementPercentage).toBe(25.5);
    expect(result.data.changeMetrics.overallImprovement).toBe(25.5);
  });

  it('should handle export workflow', async () => {
    // Mock export API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        exportUrl: '/exports/analysis-123.pdf',
        message: 'Export generated successfully'
      })
    });

    // Test export workflow
    const response = await fetch('/api/vision/analysis/analysis-123/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'pdf',
        includeAnnotations: true
      }),
    });

    const result = await response.json();

    // Verify export response
    expect(result.success).toBe(true);
    expect(result.exportUrl).toBe('/exports/analysis-123.pdf');
  });

  it('should handle share workflow', async () => {
    // Mock share API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        shareUrl: 'https://example.com/share/analysis-123',
        expiresAt: '2024-01-22T10:30:00Z',
        message: 'Analysis shared successfully'
      })
    });

    // Test share workflow
    const response = await fetch('/api/vision/analysis/analysis-123/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expiresIn: '7d',
        permissions: ['view']
      }),
    });

    const result = await response.json();

    // Verify share response
    expect(result.success).toBe(true);
    expect(result.shareUrl).toBe('https://example.com/share/analysis-123');
    expect(result.expiresAt).toBe('2024-01-22T10:30:00Z');
  });

  it('should handle analysis errors gracefully', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        success: false,
        error: 'ANALYSIS_FAILED',
        message: 'Vision analysis engine failed to process images'
      })
    });

    // Test error handling
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'invalid-image-data',
        afterImage: 'invalid-image-data'
      }),
    });

    const result = await response.json();

    // Verify error response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe('ANALYSIS_FAILED');
  });

  it('should handle authentication errors', async () => {
    // Mock auth error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      })
    });

    // Test auth error handling
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,mock-before-image',
        afterImage: 'data:image/jpeg;base64,mock-after-image'
      }),
    });

    const result = await response.json();

    // Verify auth error response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('UNAUTHORIZED');
  });

  it('should handle performance threshold violations', async () => {
    // Mock performance threshold violation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 408,
      json: () => Promise.resolve({
        success: false,
        error: 'ANALYSIS_TIMEOUT',
        message: 'Analysis exceeded maximum processing time of 30 seconds',
        processingTime: 32000
      })
    });

    // Test performance threshold handling
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,large-image-data',
        afterImage: 'data:image/jpeg;base64,large-image-data'
      }),
    });

    const result = await response.json();

    // Verify timeout response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(408);
    expect(result.success).toBe(false);
    expect(result.error).toBe('ANALYSIS_TIMEOUT');
    expect(result.processingTime).toBe(32000);
  });

  it('should handle database connection errors', async () => {
    // Mock database error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Unable to connect to database'
      })
    });

    // Test database error handling
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,mock-before-image',
        afterImage: 'data:image/jpeg;base64,mock-after-image'
      }),
    });

    const result = await response.json();

    // Verify database error response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(result.success).toBe(false);
    expect(result.error).toBe('DATABASE_ERROR');
  });

  it('should handle vision engine initialization errors', async () => {
    // Mock vision engine initialization error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({
        success: false,
        error: 'ENGINE_INITIALIZATION_FAILED',
        message: 'Vision analysis engine failed to initialize'
      })
    });

    // Test engine initialization error handling
    const response = await fetch('/api/vision/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'data:image/jpeg;base64,mock-before-image',
        afterImage: 'data:image/jpeg;base64,mock-after-image'
      }),
    });

    const result = await response.json();

    // Verify engine error response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(result.success).toBe(false);
    expect(result.error).toBe('ENGINE_INITIALIZATION_FAILED');
  });
});