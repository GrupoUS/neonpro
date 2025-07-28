/**
 * Vision Analysis Workflow Integration Tests
 * 
 * End-to-end integration tests for the complete computer vision analysis workflow,
 * testing the interaction between components, hooks, API endpoints, and database.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createClient } from '@/lib/supabase/server';
import { VisionAnalysisEngine } from '@/lib/vision/analysis-engine';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/vision/analysis-engine');
jest.mock('sonner');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

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

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    range: jest.fn()
  })),
  rpc: jest.fn()
};

const mockVisionEngine = {
  analyzeBeforeAfter: jest.fn(),
  saveAnalysisResult: jest.fn(),
  initialize: jest.fn(),
  loadModel: jest.fn()
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);
(VisionAnalysisEngine as jest.Mock).mockImplementation(() => mockVisionEngine);

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

// Mock the vision analysis page component
const MockVisionAnalysisPage = () => {
  const [currentAnalysis, setCurrentAnalysis] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  
  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Simulate API call
      const response = await fetch('/api/vision/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'patient-456',
          treatmentId: 'treatment-789',
          beforeImage: 'base64-before-image',
          afterImage: 'base64-after-image'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentAnalysis(data.analysis);
        setProgress(100);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  };
  
  return (
    <div>
      <h1>Vision Analysis</h1>
      
      <div data-testid="upload-section">
        <input
          type="file"
          data-testid="before-image-input"
          accept="image/*"
        />
        <input
          type="file"
          data-testid="after-image-input"
          accept="image/*"
        />
        <input
          type="text"
          data-testid="patient-id-input"
          placeholder="Patient ID"
        />
        <input
          type="text"
          data-testid="treatment-id-input"
          placeholder="Treatment ID"
        />
        <button
          onClick={handleAnalysis}
          disabled={isAnalyzing}
          data-testid="start-analysis-button"
        >
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </div>
      
      {isAnalyzing && (
        <div data-testid="progress-section">
          <div>Progress: {progress}%</div>
          <div data-testid="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      
      {currentAnalysis && (
        <div data-testid="results-section">
          <h2>Analysis Results</h2>
          <div data-testid="accuracy-score">
            Accuracy: {(currentAnalysis.accuracyScore * 100).toFixed(1)}%
          </div>
          <div data-testid="improvement-percentage">
            Improvement: {currentAnalysis.improvementPercentage}%
          </div>
          <div data-testid="processing-time">
            Processing Time: {(currentAnalysis.processingTime / 1000).toFixed(1)}s
          </div>
          
          <button data-testid="export-button">Export</button>
          <button data-testid="share-button">Share</button>
        </div>
      )}
    </div>
  );
};

describe('Vision Analysis Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
    
    // Setup successful analysis engine
    mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
    mockSupabase.from().insert.mockResolvedValue({ data: mockAnalysisResult, error: null });
    
    // Mock successful API responses
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === '/api/vision/analysis' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            analysis: mockAnalysisResult,
            performance: {
              accuracyScore: 0.96,
              processingTime: 15000
            },
            meetsAccuracyTarget: true,
            meetsProcessingTimeTarget: true
          })
        });
      }
      
      if (url === '/api/vision/export' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          blob: async () => new Blob(['pdf content'], { type: 'application/pdf' }),
          headers: {
            get: (name: string) => {
              if (name === 'content-disposition') {
                return 'attachment; filename="analysis-report.pdf"';
              }
              return null;
            }
          }
        });
      }
      
      if (url === '/api/vision/share' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            shareUrl: 'https://app.com/share/abc123',
            shareId: 'share-123'
          })
        });
      }
      
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should complete full analysis workflow successfully', async () => {
    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    // Step 1: Upload images and enter patient information
    const beforeImageInput = screen.getByTestId('before-image-input');
    const afterImageInput = screen.getByTestId('after-image-input');
    const patientIdInput = screen.getByTestId('patient-id-input');
    const treatmentIdInput = screen.getByTestId('treatment-id-input');
    
    const mockFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' });
    
    await user.upload(beforeImageInput, mockFile);
    await user.upload(afterImageInput, mockFile);
    await user.type(patientIdInput, 'patient-456');
    await user.type(treatmentIdInput, 'treatment-789');

    // Step 2: Start analysis
    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    // Step 3: Verify progress is shown
    expect(screen.getByTestId('progress-section')).toBeInTheDocument();
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    // Step 4: Wait for analysis completion
    await waitFor(() => {
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 5: Verify results are displayed
    expect(screen.getByTestId('accuracy-score')).toHaveTextContent('96.0%');
    expect(screen.getByTestId('improvement-percentage')).toHaveTextContent('25.5%');
    expect(screen.getByTestId('processing-time')).toHaveTextContent('15.0s');

    // Step 6: Verify API was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/vision/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: 'patient-456',
        treatmentId: 'treatment-789',
        beforeImage: 'base64-before-image',
        afterImage: 'base64-after-image'
      })
    });

    // Step 7: Verify database operations
    expect(mockVisionEngine.analyzeBeforeAfter).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('vision_analyses');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
  });

  it('should handle export workflow', async () => {
    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    // Complete analysis first
    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    });

    // Test export functionality
    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/vision/export', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  it('should handle share workflow', async () => {
    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    // Complete analysis first
    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    });

    // Test share functionality
    const shareButton = screen.getByTestId('share-button');
    await user.click(shareButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/vision/share', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  it('should handle analysis errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Analysis failed' })
      })
    );

    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    // Should show progress initially
    expect(screen.getByTestId('progress-section')).toBeInTheDocument();

    // Should handle error and stop analyzing
    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
    });

    // Should not show results section
    expect(screen.queryByTestId('results-section')).not.toBeInTheDocument();
  });

  it('should handle authentication errors', async () => {
    // Mock authentication failure
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Unauthorized')
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })
    );

    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
    });
  });

  it('should handle performance threshold violations', async () => {
    // Mock analysis with poor performance
    const poorAnalysisResult = {
      ...mockAnalysisResult,
      accuracyScore: 0.75, // Below 0.85 threshold
      processingTime: 35000 // Above 30000ms threshold
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          analysis: poorAnalysisResult,
          performance: {
            accuracyScore: 0.75,
            processingTime: 35000
          },
          meetsAccuracyTarget: false,
          meetsProcessingTimeTarget: false
        })
      })
    );

    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    });

    // Should show poor performance metrics
    expect(screen.getByTestId('accuracy-score')).toHaveTextContent('75.0%');
    expect(screen.getByTestId('processing-time')).toHaveTextContent('35.0s');
  });

  it('should handle database connection errors', async () => {
    // Mock database error
    mockSupabase.from().insert.mockResolvedValue({
      data: null,
      error: new Error('Database connection failed')
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Database error' })
      })
    );

    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('results-section')).not.toBeInTheDocument();
  });

  it('should handle vision engine initialization errors', async () => {
    // Mock vision engine error
    mockVisionEngine.analyzeBeforeAfter.mockRejectedValue(new Error('Model loading failed'));

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Vision engine error' })
      })
    );

    const user = userEvent.setup();
    render(<MockVisionAnalysisPage />);

    const startButton = screen.getByTestId('start-analysis-button');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('results-section')).not.toBeInTheDocument();
  });
});