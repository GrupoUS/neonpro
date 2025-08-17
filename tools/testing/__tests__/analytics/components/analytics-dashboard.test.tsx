import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  afterEach,
  afterEach,
  beforeEach,
  beforeEach,
  describe,
  describe,
  expect,
  expect,
  jest,
  jest,
  test,
  test,
  vi,
} from 'vitest';
import AnalyticsDashboard from '@/components/dashboard/analytics-dashboard';

// Mock the recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Pie: () => <div data-testid="pie" />,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: jest.fn((_date, formatStr) => {
    if (formatStr === 'MMM yyyy') {
      return 'Jan 2024';
    }
    if (formatStr === 'dd/MM/yyyy') {
      return '01/01/2024';
    }
    return '2024-01-01';
  }),
  subMonths: jest.fn(() => new Date('2023-12-01')),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  parseISO: jest.fn((dateStr) => new Date(dateStr)),
}));

// Mock analytics service
vi.mock('@/lib/analytics/service', () => ({
  analyticsService: {
    getDashboardMetrics: vi.fn(),
    getSubscriptionTrends: vi.fn(),
    getTrialMetrics: vi.fn(),
    getRevenueAnalytics: vi.fn(),
  },
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button
      data-size={size}
      data-testid="button"
      data-variant={variant}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-onchange={onValueChange} data-testid="select">
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
}));

const { analyticsService } = require('@/lib/analytics/service');

describe('AnalyticsDashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('rendering and layout', () => {
    test('should render dashboard with all metric cards', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
          arr: 180_000,
          churnRate: 0.05,
          growthRate: 0.12,
        },
        trialMetrics: {
          totalTrials: 500,
          activeTrials: 150,
          conversionRate: 0.25,
        },
        revenueMetrics: {
          totalRevenue: 180_000,
          monthlyGrowth: 0.12,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument(); // Total subscriptions
        expect(screen.getByText('125')).toBeInTheDocument(); // Active subscriptions
        expect(screen.getByText('$15,000')).toBeInTheDocument(); // MRR
        expect(screen.getByText('$180,000')).toBeInTheDocument(); // ARR
      });
    });

    test('should display loading state initially', () => {
      // Arrange
      analyticsService.getDashboardMetrics.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('should display error state when data fetch fails', async () => {
      // Arrange
      analyticsService.getDashboardMetrics.mockRejectedValue(
        new Error('Failed to fetch data')
      );

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Error loading analytics data')
        ).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('should render charts when data is available', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
          arr: 180_000,
          churnRate: 0.05,
          growthRate: 0.12,
        },
        chartData: {
          subscriptionTrends: [
            { month: 'Jan', subscriptions: 100, revenue: 10_000 },
            { month: 'Feb', subscriptions: 125, revenue: 12_500 },
            { month: 'Mar', subscriptions: 150, revenue: 15_000 },
          ],
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    test('should update date range when period selector changes', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('select')).toBeInTheDocument();
      });

      // Act
      const periodSelector = screen.getByTestId('select-trigger');
      fireEvent.click(periodSelector);

      const lastMonthOption = screen.getByText('Last Month');
      fireEvent.click(lastMonthOption);

      // Assert
      await waitFor(() => {
        expect(analyticsService.getDashboardMetrics).toHaveBeenCalledWith({
          period: 'last_month',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        });
      });
    });

    test('should refresh data when refresh button is clicked', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Clear previous calls
      analyticsService.getDashboardMetrics.mockClear();

      // Act
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(analyticsService.getDashboardMetrics).toHaveBeenCalledTimes(1);
      });
    });

    test('should retry data fetch when retry button is clicked', async () => {
      // Arrange
      analyticsService.getDashboardMetrics
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          subscriptionMetrics: {
            totalSubscriptions: 150,
            activeSubscriptions: 125,
            mrr: 15_000,
          },
        });

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Act
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(analyticsService.getDashboardMetrics).toHaveBeenCalledTimes(2);
      });
    });

    test('should toggle chart view when view selector changes', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
        chartData: {
          subscriptionTrends: [],
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });

      // Act
      const chartTypeButton = screen.getByText('Bar Chart');
      fireEvent.click(chartTypeButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });
  });

  describe('data formatting and display', () => {
    test('should format currency values correctly', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
          arr: 180_000,
        },
        revenueMetrics: {
          totalRevenue: 2_500_000, // $2.5M
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('$15,000')).toBeInTheDocument(); // MRR
        expect(screen.getByText('$180,000')).toBeInTheDocument(); // ARR
        expect(screen.getByText('$2,500,000')).toBeInTheDocument(); // Total revenue
      });
    });

    test('should format percentage values correctly', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          churnRate: 0.0534, // 5.34%
          growthRate: 0.1256, // 12.56%
        },
        trialMetrics: {
          conversionRate: 0.2489, // 24.89%
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('5.34%')).toBeInTheDocument(); // Churn rate
        expect(screen.getByText('12.56%')).toBeInTheDocument(); // Growth rate
        expect(screen.getByText('24.89%')).toBeInTheDocument(); // Conversion rate
      });
    });

    test('should display trend indicators', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          subscriptionsTrend: 0.12, // +12%
          mrrTrend: -0.05, // -5%
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('trend-up')).toBeInTheDocument();
        expect(screen.getByTestId('trend-down')).toBeInTheDocument();
        expect(screen.getByText('+12%')).toBeInTheDocument();
        expect(screen.getByText('-5%')).toBeInTheDocument();
      });
    });
  });

  describe('responsive behavior', () => {
    test('should adapt to mobile viewport', async () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        const dashboard = screen.getByTestId('analytics-dashboard');
        expect(dashboard).toHaveClass('mobile-layout');
      });
    });

    test('should show/hide detailed metrics based on screen size', async () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
          detailedMetrics: {
            averageSubscriptionValue: 120,
            lifetimeValue: 1200,
          },
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        // Detailed metrics should be hidden on smaller screens
        expect(
          screen.queryByText('Average Subscription Value')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Customer Lifetime Value')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('main', { name: 'Analytics Dashboard' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('region', { name: 'Subscription Metrics' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('region', { name: 'Trial Metrics' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('region', { name: 'Revenue Charts' })
        ).toBeInTheDocument();
      });
    });

    test('should support keyboard navigation', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Act
      const refreshButton = screen.getByText('Refresh');
      refreshButton.focus();

      // Simulate Tab key press
      fireEvent.keyDown(refreshButton, { key: 'Tab', code: 'Tab' });

      // Assert
      expect(document.activeElement).not.toBe(refreshButton);
    });

    test('should announce data updates to screen readers', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Act
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Analytics data updated')).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('performance optimization', () => {
    test('should memoize expensive calculations', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
        rawData: new Array(1000).fill(null).map((_, i) => ({
          id: i,
          value: Math.random() * 1000,
        })),
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      renderWithQueryClient(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });

      // Act - Re-render with same data
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert - Should not recalculate expensive operations
      expect(screen.getByTestId('memoized-calculations')).toBeInTheDocument();
    });

    test('should implement virtual scrolling for large datasets', async () => {
      // Arrange
      const mockMetrics = {
        subscriptionMetrics: {
          totalSubscriptions: 150,
          activeSubscriptions: 125,
          mrr: 15_000,
        },
        detailsList: new Array(10_000).fill(null).map((_, i) => ({
          id: i,
          name: `Subscription ${i}`,
          value: Math.random() * 1000,
        })),
      };

      analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      // Act
      renderWithQueryClient(<AnalyticsDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
        // Only visible items should be rendered
        expect(screen.getAllByTestId('subscription-item')).toHaveLength(10);
      });
    });
  });
});
