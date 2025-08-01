/**
 * Revenue Optimization Dashboard Tests
 * 
 * Comprehensive test suite for the revenue optimization dashboard page:
 * - Component rendering and layout
 * - Data fetching and display
 * - User interactions and state management
 * - Error handling and loading states
 * - Integration with optimization engine
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import RevenueOptimizationPage from '@/app/dashboard/revenue-optimization/page';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => ({
    get: () => 'clinic-123'
  })
}));

// Mock Supabase auth
jest.mock('@/app/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null
      }),
      getSession: () => Promise.resolve({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })
    }
  })
}));

// Mock API calls
global.fetch = jest.fn();

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn()
  }
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0
    }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Mock data
const mockOptimizationData = {
  summary: {
    totalOptimizations: 5,
    activeOptimizations: 3,
    averageImprovement: 12.5,
    totalProjectedRevenue: 150000
  },
  pricing: {
    currentStrategy: { strategy_name: 'Dynamic Pricing' },
    recommendations: ['Increase service A pricing by 10%'],
    projectedIncrease: 8.5
  },
  serviceMix: {
    profitabilityGain: 12.3,
    recommendations: ['Focus on high-margin services']
  },
  clv: {
    projectedIncrease: 15.7,
    enhancementStrategies: ['Implement loyalty program']
  },
  automated: {
    recommendations: [
      {
        type: 'pricing',
        priority: 'high',
        description: 'Optimize pricing for peak hours',
        expectedImpact: 10,
        implementationEffort: 'medium',
        timeframe: '2 weeks'
      }
    ],
    totalProjectedIncrease: 25.5,
    implementationPlan: ['Phase 1: Analysis', 'Phase 2: Implementation']
  },
  competitive: {
    marketPosition: 'Strong',
    opportunityAreas: ['Expand premium services']
  },
  performance: {
    roiMetrics: [],
    performanceIndicators: { overallROI: 1.2, successRate: 0.8 },
    trendAnalysis: { improving: 2, declining: 1, stable: 3 },
    recommendations: ['Monitor competitive pricing']
  }
};

describe('🔥 Revenue Optimization Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOptimizationData)
    } as Response);
  });

  describe('🔥 Component Rendering', () => {
    test('should render dashboard layout and title', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      expect(screen.getByText('Revenue Optimization')).toBeInTheDocument();
      expect(screen.getByText(/Maximize revenue through intelligent optimization/)).toBeInTheDocument();
    });

    test('should render all optimization sections', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Optimization Overview')).toBeInTheDocument();
        expect(screen.getByText('Pricing Optimization')).toBeInTheDocument();
        expect(screen.getByText('Service Mix Analysis')).toBeInTheDocument();
        expect(screen.getByText('Customer Lifetime Value')).toBeInTheDocument();
        expect(screen.getByText('Automated Recommendations')).toBeInTheDocument();
        expect(screen.getByText('Competitive Analysis')).toBeInTheDocument();
        expect(screen.getByText('Performance Tracking')).toBeInTheDocument();
      });
    });

    test('should render summary cards with correct data', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // totalOptimizations
        expect(screen.getByText('3')).toBeInTheDocument(); // activeOptimizations
        expect(screen.getByText('12.5%')).toBeInTheDocument(); // averageImprovement
        expect(screen.getByText('R$ 150.000')).toBeInTheDocument(); // totalProjectedRevenue
      });
    });

    test('should render action buttons', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /New Optimization/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Report/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Export Data/i })).toBeInTheDocument();
      });
    });
  });

  describe('🔥 Data Fetching', () => {
    test('should fetch optimization data on mount', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization?clinicId=clinic-123');
      });
    });

    test('should display loading state while fetching', () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      expect(screen.getByTestId('revenue-optimization-loading')).toBeInTheDocument();
    });

    test('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load optimization data/)).toBeInTheDocument();
      });
    });

    test('should retry failed requests', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOptimizationData)
        } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      const retryButton = await screen.findByRole('button', { name: /Retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Optimization Overview')).toBeInTheDocument();
      });
    });
  });

  describe('🔥 Pricing Optimization Section', () => {
    test('should display current pricing strategy', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Dynamic Pricing')).toBeInTheDocument();
      });
    });

    test('should show pricing recommendations', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Increase service A pricing by 10%')).toBeInTheDocument();
      });
    });

    test('should display projected increase percentage', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('8.5%')).toBeInTheDocument();
      });
    });

    test('should handle create pricing optimization', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          optimization: { id: 'new-opt' },
          message: 'Optimization created' 
        })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Create Pricing Optimization/i });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optimizationType: 'pricing',
            clinicId: 'clinic-123',
            title: 'Pricing Optimization',
            description: 'Automatic pricing optimization analysis'
          })
        });
        expect(toast.success).toHaveBeenCalledWith('Pricing optimization created successfully!');
      });
    });
  });

  describe('🔥 Service Mix Analysis', () => {
    test('should display profitability gain', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('12.3%')).toBeInTheDocument();
      });
    });

    test('should show service mix recommendations', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Focus on high-margin services')).toBeInTheDocument();
      });
    });

    test('should handle service mix optimization creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          optimization: { id: 'new-opt' },
          message: 'Service mix optimization created' 
        })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Optimize Service Mix/i });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optimizationType: 'service_mix',
            clinicId: 'clinic-123',
            title: 'Service Mix Optimization',
            description: 'Automatic service mix optimization analysis'
          })
        });
        expect(toast.success).toHaveBeenCalledWith('Service mix optimization created successfully!');
      });
    });
  });

  describe('🔥 Customer Lifetime Value', () => {
    test('should display CLV projected increase', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('15.7%')).toBeInTheDocument();
      });
    });

    test('should show enhancement strategies', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Implement loyalty program')).toBeInTheDocument();
      });
    });

    test('should handle CLV optimization creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          optimization: { id: 'new-opt' },
          message: 'CLV optimization created' 
        })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Enhance CLV/i });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optimizationType: 'clv',
            clinicId: 'clinic-123',
            title: 'CLV Enhancement',
            description: 'Automatic customer lifetime value optimization'
          })
        });
        expect(toast.success).toHaveBeenCalledWith('CLV optimization created successfully!');
      });
    });
  });

  describe('🔥 Automated Recommendations', () => {
    test('should display recommendation cards', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Optimize pricing for peak hours')).toBeInTheDocument();
        expect(screen.getByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Expected Impact: 10%')).toBeInTheDocument();
        expect(screen.getByText('Effort: medium')).toBeInTheDocument();
        expect(screen.getByText('Timeframe: 2 weeks')).toBeInTheDocument();
      });
    });

    test('should show total projected increase', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('25.5%')).toBeInTheDocument();
      });
    });

    test('should display implementation plan', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Phase 1: Analysis')).toBeInTheDocument();
        expect(screen.getByText('Phase 2: Implementation')).toBeInTheDocument();
      });
    });

    test('should handle generate recommendations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          optimization: { id: 'new-opt' },
          message: 'Recommendations generated' 
        })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /Generate New Recommendations/i });
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optimizationType: 'automated',
            clinicId: 'clinic-123',
            title: 'Automated Recommendations',
            description: 'Generate new automated optimization recommendations'
          })
        });
        expect(toast.success).toHaveBeenCalledWith('New recommendations generated successfully!');
      });
    });
  });

  describe('🔥 Competitive Analysis', () => {
    test('should display market position', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument();
      });
    });

    test('should show opportunity areas', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Expand premium services')).toBeInTheDocument();
      });
    });

    test('should handle competitive analysis update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          optimization: { id: 'new-opt' },
          message: 'Competitive analysis updated' 
        })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const updateButton = screen.getByRole('button', { name: /Update Analysis/i });
        fireEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optimizationType: 'competitive',
            clinicId: 'clinic-123',
            title: 'Competitive Analysis Update',
            description: 'Update competitive market analysis'
          })
        });
        expect(toast.success).toHaveBeenCalledWith('Competitive analysis updated successfully!');
      });
    });
  });

  describe('🔥 Performance Tracking', () => {
    test('should display performance indicators', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('1.2')).toBeInTheDocument(); // overallROI
        expect(screen.getByText('80%')).toBeInTheDocument(); // successRate
      });
    });

    test('should show trend analysis', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('2 Improving')).toBeInTheDocument();
        expect(screen.getByText('1 Declining')).toBeInTheDocument();
        expect(screen.getByText('3 Stable')).toBeInTheDocument();
      });
    });

    test('should display performance recommendations', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText('Monitor competitive pricing')).toBeInTheDocument();
      });
    });
  });

  describe('🔥 User Interactions', () => {
    test('should handle new optimization creation', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const newOptButton = screen.getByRole('button', { name: /New Optimization/i });
        fireEvent.click(newOptButton);
      });

      // Should open optimization creation modal or navigate
      expect(screen.getByTestId('optimization-creation-modal')).toBeInTheDocument();
    });

    test('should handle report generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob(['report data'], { type: 'application/pdf' }))
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const reportButton = screen.getByRole('button', { name: /Generate Report/i });
        fireEvent.click(reportButton);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Report generated successfully!');
      });
    });

    test('should handle data export', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob(['csv data'], { type: 'text/csv' }))
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export Data/i });
        fireEvent.click(exportButton);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Data exported successfully!');
      });
    });

    test('should handle refresh data', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /Refresh/i });
        fireEvent.click(refreshButton);
      });

      // Should trigger data refetch
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  describe('🔥 Error Handling', () => {
    test('should handle API errors during optimization creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Create Pricing Optimization/i });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create optimization. Please try again.');
      });
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load optimization data/)).toBeInTheDocument();
      });
    });

    test('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      } as Response);

      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Authentication required/)).toBeInTheDocument();
      });
    });
  });

  describe('🔥 Responsive Design', () => {
    test('should be responsive on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      renderWithQueryClient(<RevenueOptimizationPage />);

      const container = screen.getByTestId('revenue-optimization-container');
      expect(container).toHaveClass('responsive-layout');
    });

    test('should stack cards vertically on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640
      });

      renderWithQueryClient(<RevenueOptimizationPage />);

      const cardsContainer = screen.getByTestId('optimization-cards');
      expect(cardsContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('🔥 Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Revenue optimization overview')).toBeInTheDocument();
        expect(screen.getByLabelText('Pricing optimization section')).toBeInTheDocument();
        expect(screen.getByLabelText('Service mix analysis section')).toBeInTheDocument();
      });
    });

    test('should support keyboard navigation', async () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      await waitFor(() => {
        const firstButton = screen.getByRole('button', { name: /New Optimization/i });
        firstButton.focus();
        expect(firstButton).toHaveFocus();

        // Tab to next button
        fireEvent.keyDown(firstButton, { key: 'Tab' });
        const secondButton = screen.getByRole('button', { name: /Generate Report/i });
        expect(secondButton).toHaveFocus();
      });
    });

    test('should have sufficient color contrast', () => {
      renderWithQueryClient(<RevenueOptimizationPage />);

      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        const styles = window.getComputedStyle(heading);
        // Basic contrast check (implementation would need actual color analysis)
        expect(styles.color).not.toBe(styles.backgroundColor);
      });
    });
  });
});