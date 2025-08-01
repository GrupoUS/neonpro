/**
 * Demand Forecasting Dashboard Tests - Story 11.1
 * 
 * Comprehensive test suite for demand forecasting dashboard component
 * Tests UI functionality, data visualization, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForecastingDashboard from '@/src/components/dashboard/forecasting/forecasting-dashboard';
import { toast } from 'sonner';

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the chart components to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    if (formatString === 'MMM dd') return 'Feb 15';
    if (formatString === 'MMM dd, yyyy') return 'Feb 15, 2024';
    if (formatString === 'yyyy-MM-dd') return '2024-02-15';
    return '2024-02-15T10:00:00Z';
  }),
  parseISO: jest.fn((dateString) => new Date(dateString)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockForecastData = {
  forecasts: [
    {
      id: 'forecast-1',
      forecast_type: 'weekly',
      service_id: 'service-1',
      period_start: '2024-02-01T00:00:00Z',
      period_end: '2024-02-07T23:59:59Z',
      predicted_demand: 35,
      confidence_level: 0.92,
      factors_considered: ['historical_data', 'seasonal_patterns'],
      metadata: {
        algorithm_version: '1.0',
        data_quality_score: 0.95,
        computation_time_ms: 250
      },
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    },
    {
      id: 'forecast-2',
      forecast_type: 'monthly',
      service_id: 'service-2',
      period_start: '2024-02-01T00:00:00Z',
      period_end: '2024-02-29T23:59:59Z',
      predicted_demand: 120,
      confidence_level: 0.88,
      factors_considered: ['historical_data', 'seasonal_patterns', 'external_factors'],
      metadata: {
        algorithm_version: '1.0',
        data_quality_score: 0.92,
        computation_time_ms: 380
      },
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    }
  ],
  accuracy: 0.90,
  generated_at: '2024-01-25T10:00:00Z'
};

const mockAlertsData = [
  {
    id: 'alert-1',
    alert_type: 'high_demand',
    severity: 'warning',
    message: 'High demand predicted for service-1 next week',
    status: 'active',
    forecast_id: 'forecast-1',
    created_at: '2024-01-25T09:00:00Z'
  },
  {
    id: 'alert-2',
    alert_type: 'capacity_shortage',
    severity: 'critical',
    message: 'Insufficient capacity for predicted demand',
    status: 'active',
    forecast_id: 'forecast-2',
    created_at: '2024-01-25T08:00:00Z'
  }
];

const mockResourceAllocationData = {
  recommendations: [
    {
      forecast_id: 'forecast-1',
      staffing: {
        required_staff_count: 8,
        skill_requirements: ['aesthetic_procedures', 'patient_care'],
        shift_distribution: { morning: 3, afternoon: 3, evening: 2 }
      },
      equipment: {
        required_equipment: ['treatment_rooms', 'aesthetic_devices'],
        utilization_target: 0.85
      },
      cost_optimization: {
        total_cost_impact: 15000,
        efficiency_gains: 12.5,
        roi_projection: 1.35
      },
      priority_level: 'high'
    }
  ],
  optimization_strategy: 'balanced',
  total_cost_impact: 15000,
  efficiency_improvement: 12.5
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ForecastingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/forecasting/alerts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockAlertsData }),
        });
      }
      
      if (url.includes('/api/forecasting/resource-allocation') && url.includes('POST')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockResourceAllocationData }),
        });
      }
      
      if (url.includes('/api/forecasting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockForecastData }),
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  describe('Component Rendering', () => {
    test('should render dashboard header with title and controls', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      expect(screen.getByText('Demand Forecasting')).toBeInTheDocument();
      expect(screen.getByText('AI-powered demand prediction with ≥80% accuracy')).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
    });

    test('should render key metrics cards', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
        expect(screen.getByText('Active Forecasts')).toBeInTheDocument();
        expect(screen.getByText('Active Alerts')).toBeInTheDocument();
        expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
      });
    });

    test('should render tabs for different views', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /forecasts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /resources/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /alerts/i })).toBeInTheDocument();
    });

    test('should display loading skeletons while fetching data', () => {
      // Mock pending API call
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithQueryClient(<ForecastingDashboard />);

      // Should show skeleton loaders
      expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(4); // One for each metric card
    });
  });

  describe('Metrics Display', () => {
    test('should calculate and display correct accuracy percentage', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('90%')).toBeInTheDocument(); // mockForecastData.accuracy * 100
        expect(screen.getByText('Above 80% threshold')).toBeInTheDocument();
      });
    });

    test('should show warning when accuracy is below threshold', async () => {
      // Mock low accuracy data
      const lowAccuracyData = { ...mockForecastData, accuracy: 0.75 };
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/forecasting/alerts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockAlertsData }),
          });
        }
        if (url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: lowAccuracyData }),
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('Below 80% threshold')).toBeInTheDocument();
      });
    });

    test('should display correct count of active forecasts', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // mockForecastData.forecasts.length
      });
    });

    test('should display correct count of active alerts', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // mockAlertsData.length
      });
    });

    test('should calculate and display average confidence', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        const avgConfidence = Math.round(((0.92 + 0.88) / 2) * 100); // Average of forecast confidence levels
        expect(screen.getByText(`${avgConfidence}%`)).toBeInTheDocument();
      });
    });
  });

  describe('Chart Rendering', () => {
    test('should render demand forecast trend chart', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Demand Forecast Trend')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    test('should render confidence distribution chart', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Confidence Distribution')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    test('should display accuracy status with progress bar', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Accuracy Status')).toBeInTheDocument();
        expect(screen.getByText('90% / 80% required')).toBeInTheDocument();
        expect(screen.getByText('Meeting accuracy requirements')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('should switch between tabs correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      // Start on overview tab
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Demand Forecast Trend');

      // Switch to forecasts tab
      await user.click(screen.getByRole('tab', { name: /forecasts/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Forecast Details')).toBeInTheDocument();
      });

      // Switch to resources tab
      await user.click(screen.getByRole('tab', { name: /resources/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Resource Allocation')).toBeInTheDocument();
      });

      // Switch to alerts tab
      await user.click(screen.getByRole('tab', { name: /alerts/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      });
    });
  });

  describe('Forecasts Tab', () => {
    test('should display forecast details correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /forecasts/i }));

      await waitFor(() => {
        expect(screen.getByText('WEEKLY')).toBeInTheDocument();
        expect(screen.getByText('MONTHLY')).toBeInTheDocument();
        expect(screen.getByText('35 appointments')).toBeInTheDocument();
        expect(screen.getByText('120 appointments')).toBeInTheDocument();
        expect(screen.getByText('92% confidence')).toBeInTheDocument();
        expect(screen.getByText('88% confidence')).toBeInTheDocument();
      });
    });

    test('should handle empty forecasts gracefully', async () => {
      // Mock empty forecasts
      const emptyData = { ...mockForecastData, forecasts: [] };
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/forecasting/alerts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] }),
          });
        }
        if (url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: emptyData }),
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /forecasts/i }));

      await waitFor(() => {
        expect(screen.getByText('No forecasts available')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate forecasts/i })).toBeInTheDocument();
      });
    });
  });

  describe('Resources Tab', () => {
    test('should display resource allocation recommendations', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /resources/i }));

      await waitFor(() => {
        expect(screen.getByText('8 Staff Members')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getByText('Cost Impact: $15,000')).toBeInTheDocument();
        expect(screen.getByText('Efficiency Gain: 12.5%')).toBeInTheDocument();
      });
    });

    test('should handle no resource allocations', async () => {
      // Mock empty forecasts to trigger no allocations
      const emptyData = { ...mockForecastData, forecasts: [] };
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: emptyData }),
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /resources/i }));

      await waitFor(() => {
        expect(screen.getByText('No resource allocations available. Generate forecasts first.')).toBeInTheDocument();
      });
    });
  });

  describe('Alerts Tab', () => {
    test('should display active alerts correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /alerts/i }));

      await waitFor(() => {
        expect(screen.getByText('High demand - warning')).toBeInTheDocument();
        expect(screen.getByText('Capacity shortage - critical')).toBeInTheDocument();
        expect(screen.getByText('High demand predicted for service-1 next week')).toBeInTheDocument();
        expect(screen.getByText('Insufficient capacity for predicted demand')).toBeInTheDocument();
      });
    });

    test('should handle no active alerts', async () => {
      // Mock empty alerts
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/forecasting/alerts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] }),
          });
        }
        if (url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockForecastData }),
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      await user.click(screen.getByRole('tab', { name: /alerts/i }));

      await waitFor(() => {
        expect(screen.getByText('No active alerts')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    test('should handle regenerate forecast button click', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
      await user.click(regenerateButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Demand forecast generated successfully');
      });
    });

    test('should handle export data button click', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      // Mock URL.createObjectURL and link click
      const mockCreateObjectURL = jest.fn(() => 'mock-url');
      const mockRevokeObjectURL = jest.fn();
      Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
      Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

      const mockClick = jest.fn();
      const mockLink = { href: '', download: '', click: mockClick };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).not.toBeDisabled();
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Forecast data exported successfully');
      });
    });

    test('should disable export button when no data available', async () => {
      // Mock empty forecasts
      const emptyData = { ...mockForecastData, forecasts: [] };
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: emptyData }),
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('should display error message when API call fails', async () => {
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ success: false, error: { message: 'Server error' } }),
        })
      );

      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Forecasts')).toBeInTheDocument();
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Forecasts')).toBeInTheDocument();
      });
    });

    test('should show error toast when regenerate fails', async () => {
      const user = userEvent.setup();
      
      // Mock successful initial load, then failed regenerate
      let callCount = 0;
      mockFetch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1 && url.includes('/api/forecasting/alerts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockAlertsData }),
          });
        }
        if (callCount === 2 && url.includes('/api/forecasting')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockForecastData }),
          });
        }
        // Subsequent calls fail
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ success: false, error: { message: 'Regenerate failed' } }),
        });
      });

      renderWithQueryClient(<ForecastingDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
      });

      const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
      await user.click(regenerateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate forecast: Regenerate failed');
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      renderWithQueryClient(<ForecastingDashboard />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(4);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ForecastingDashboard />);

      const firstTab = screen.getByRole('tab', { name: /overview/i });
      const secondTab = screen.getByRole('tab', { name: /forecasts/i });

      await user.click(firstTab);
      expect(firstTab).toHaveAttribute('aria-selected', 'true');

      await user.tab();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });
});