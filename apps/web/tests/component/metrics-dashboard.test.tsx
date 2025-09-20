/**
 * Component Test: MetricsDashboard.tsx
 * TDD RED PHASE: These tests MUST FAIL initially
 *
 * Test Coverage:
 * - Dashboard layout and responsive grid system
 * - Data visualization integration and chart components
 * - Component interactions and navigation
 * - Accessibility features (WCAG 2.1 AA)
 * - Error handling and loading states
 * - Mobile-first responsive design
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Import component that doesn't exist yet (TDD RED)
import MetricsDashboard from '../../src/components/financial/MetricsDashboard';

// Import types that don't exist yet (TDD RED)
import type {
  DashboardConfig,
  DashboardLayout,
  MetricsDashboardProps,
  MetricWidget,
} from '../../src/types/financial-dashboard';

describe('Component: MetricsDashboard', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  // Mock dashboard configuration
  const mockDashboardConfig: DashboardConfig = {
    layout: 'grid',
    columns: 4,
    refreshInterval: 30000,
    autoRefresh: true,
    theme: 'light',
    widgets: [
      {
        id: 'mrr-widget',
        type: 'metric',
        title: 'MRR',
        position: { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
        config: {
          metric: 'mrr',
          showTrend: true,
          showPercentage: true,
        },
      },
      {
        id: 'arr-widget',
        type: 'metric',
        title: 'ARR',
        position: { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
        config: {
          metric: 'arr',
          showTrend: true,
          showPercentage: true,
        },
      },
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Revenue Trend',
        position: { row: 2, col: 1, rowSpan: 2, colSpan: 3 },
        config: {
          chartType: 'line',
          metric: 'revenue',
          period: '12_months',
        },
      },
    ],
  };

  const defaultProps: MetricsDashboardProps = {
    config: mockDashboardConfig,
    isLoading: false,
    onRefresh: vi.fn(),
    onConfigChange: vi.fn(),
    onWidgetClick: vi.fn(),
    'data-testid': 'metrics-dashboard',
  };

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup user event with realistic delays
    user = userEvent.setup({
      delay: null, // Disable delays in tests
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock ResizeObserver for responsive testing
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderWithQueryClient = (
    ui: React.ReactElement,
    options: { props?: Partial<MetricsDashboardProps> } = {},
  ) => {
    const mergedProps = { ...defaultProps, ...options.props };

    return render(
      <QueryClientProvider client={queryClient}>
        {React.cloneElement(ui, mergedProps)}
      </QueryClientProvider>,
    );
  };

  describe('Dashboard Layout', () => {
    it('should render dashboard with grid layout correctly', () => {
      // TDD RED PHASE: Test dashboard grid rendering

      // ACT: Render dashboard component
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Dashboard container and grid structure
      expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();

      // Validate grid layout styling
      const grid = screen.getByTestId('dashboard-grid');
      expect(grid).toHaveClass('dashboard-grid');
      expect(grid).toHaveStyle({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      });

      // Validate widget containers are rendered
      expect(screen.getByTestId('widget-mrr-widget')).toBeInTheDocument();
      expect(screen.getByTestId('widget-arr-widget')).toBeInTheDocument();
      expect(screen.getByTestId('widget-revenue-chart')).toBeInTheDocument();
    });

    it('should handle different dashboard layouts', () => {
      // TDD RED PHASE: Test layout variations

      // ACT: Render with flex layout
      const flexConfig = {
        ...mockDashboardConfig,
        layout: 'flex' as const,
      };

      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} config={flexConfig} />,
      );

      // ASSERT: Flex layout applied
      const dashboard = screen.getByTestId('dashboard-grid');
      expect(dashboard).toHaveClass('dashboard-flex');
      expect(dashboard).toHaveStyle({
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
      });
    });

    it('should render widget positions correctly in grid', () => {
      // TDD RED PHASE: Test widget positioning

      // ACT: Render dashboard
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Widget grid positioning
      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      expect(mrrWidget).toHaveStyle({
        gridRow: '1 / span 1',
        gridColumn: '1 / span 1',
      });

      const arrWidget = screen.getByTestId('widget-arr-widget');
      expect(arrWidget).toHaveStyle({
        gridRow: '1 / span 1',
        gridColumn: '2 / span 1',
      });

      const chartWidget = screen.getByTestId('widget-revenue-chart');
      expect(chartWidget).toHaveStyle({
        gridRow: '2 / span 2',
        gridColumn: '1 / span 3',
      });
    });
  });

  describe('Data Visualization Integration', () => {
    it('should render metric widgets with data correctly', () => {
      // TDD RED PHASE: Test metric widget data display

      // ACT: Render dashboard with metric data
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Metric widgets display data
      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      expect(within(mrrWidget).getByText('MRR')).toBeInTheDocument();
      expect(within(mrrWidget).getByTestId('metric-value')).toBeInTheDocument();
      expect(within(mrrWidget).getByTestId('metric-trend')).toBeInTheDocument();

      // Validate metric widget interaction
      expect(mrrWidget).toHaveAttribute('role', 'button');
      expect(mrrWidget).toHaveAttribute('tabindex', '0');
    });

    it('should render chart widgets with visualization', () => {
      // TDD RED PHASE: Test chart widget rendering

      // ACT: Render dashboard with chart
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Chart widget structure
      const chartWidget = screen.getByTestId('widget-revenue-chart');
      expect(
        within(chartWidget).getByText('Revenue Trend'),
      ).toBeInTheDocument();
      expect(
        within(chartWidget).getByTestId('chart-container'),
      ).toBeInTheDocument();

      // Validate chart accessibility
      const chartContainer = within(chartWidget).getByTestId('chart-container');
      expect(chartContainer).toHaveAttribute('role', 'img');
      expect(chartContainer).toHaveAttribute('aria-label');
    });

    it('should handle missing or invalid chart data', () => {
      // TDD RED PHASE: Test chart error handling

      // ACT: Render dashboard with invalid chart config
      const invalidConfig = {
        ...mockDashboardConfig,
        widgets: [
          {
            ...mockDashboardConfig.widgets[2],
            config: {
              chartType: 'invalid',
              metric: null,
              period: null,
            },
          },
        ],
      };

      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} config={invalidConfig} />,
      );

      // ASSERT: Error state displayed
      const chartWidget = screen.getByTestId('widget-revenue-chart');
      expect(
        within(chartWidget).getByTestId('chart-error'),
      ).toBeInTheDocument();
      expect(
        within(chartWidget).getByText('Erro ao carregar gráfico'),
      ).toBeInTheDocument();
    });
  });

  describe('Component Interactions', () => {
    it('should handle widget click events correctly', async () => {
      // TDD RED PHASE: Test widget interaction

      // ACT: Render dashboard and click widget
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      await user.click(mrrWidget);

      // ASSERT: Widget click callback called
      expect(defaultProps.onWidgetClick).toHaveBeenCalledTimes(1);
      expect(defaultProps.onWidgetClick).toHaveBeenCalledWith(
        'mrr-widget',
        expect.any(Object),
      );
    });

    it('should handle keyboard navigation between widgets', async () => {
      // TDD RED PHASE: Test keyboard navigation

      // ACT: Render dashboard and navigate with keyboard
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      const arrWidget = screen.getByTestId('widget-arr-widget');

      // ASSERT: Tab navigation works
      await user.tab();
      expect(mrrWidget).toHaveFocus();

      await user.tab();
      expect(arrWidget).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(defaultProps.onWidgetClick).toHaveBeenCalledWith(
        'arr-widget',
        expect.any(Object),
      );
    });

    it('should handle dashboard refresh functionality', async () => {
      // TDD RED PHASE: Test refresh mechanism

      // ACT: Render dashboard with refresh button
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      const refreshButton = screen.getByRole('button', {
        name: 'Atualizar dashboard',
      });
      await user.click(refreshButton);

      // ASSERT: Refresh callback called
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);

      // Validate loading state during refresh
      expect(refreshButton).toBeDisabled();
      expect(refreshButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should handle auto-refresh functionality', async () => {
      // TDD RED PHASE: Test auto-refresh mechanism

      // Mock timers for auto-refresh testing
      vi.useFakeTimers();

      // ACT: Render dashboard with auto-refresh enabled
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Auto-refresh timer started
      expect(defaultProps.onRefresh).not.toHaveBeenCalled();

      // Fast-forward timer
      vi.advanceTimersByTime(30000);

      // ASSERT: Auto-refresh triggered
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should meet accessibility standards', async () => {
      // TDD RED PHASE: Test accessibility compliance

      // ACT: Render dashboard
      const { container } = renderWithQueryClient(
        <MetricsDashboard {...defaultProps} />,
      );

      // ASSERT: No accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Validate dashboard ARIA structure
      const dashboard = screen.getByTestId('metrics-dashboard');
      expect(dashboard).toHaveAttribute('role', 'main');
      expect(dashboard).toHaveAttribute(
        'aria-label',
        'Dashboard de métricas financeiras',
      );

      // Validate landmark structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Controles do dashboard'),
      ).toBeInTheDocument();
    });

    it('should provide proper screen reader announcements', () => {
      // TDD RED PHASE: Test screen reader support

      // ACT: Render dashboard
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Live region for announcements
      const liveRegion = screen.getByLabelText('Anúncios do dashboard');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

      // Validate widget descriptions
      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      expect(mrrWidget).toHaveAttribute('aria-describedby');

      const description = screen.getById(
        mrrWidget.getAttribute('aria-describedby')!,
      );
      expect(description).toHaveTextContent(/widget de métrica mrr/i);
    });

    it('should support keyboard shortcuts for dashboard navigation', async () => {
      // TDD RED PHASE: Test keyboard shortcuts

      // ACT: Render dashboard and test shortcuts
      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Dashboard shortcuts work
      await user.keyboard('{r}'); // Refresh shortcut
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);

      await user.keyboard('{f}'); // Focus first widget shortcut
      const firstWidget = screen.getByTestId('widget-mrr-widget');
      expect(firstWidget).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport correctly', () => {
      // TDD RED PHASE: Test mobile responsiveness

      // ACT: Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Mobile layout applied
      const dashboard = screen.getByTestId('dashboard-grid');
      expect(dashboard).toHaveClass('dashboard-mobile');
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: '1fr',
        gap: '12px',
      });

      // Validate mobile widget styling
      const mrrWidget = screen.getByTestId('widget-mrr-widget');
      expect(mrrWidget).toHaveClass('widget-mobile');
    });

    it('should adapt to tablet viewport correctly', () => {
      // TDD RED PHASE: Test tablet responsiveness

      // ACT: Set tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithQueryClient(<MetricsDashboard {...defaultProps} />);

      // ASSERT: Tablet layout applied
      const dashboard = screen.getByTestId('dashboard-grid');
      expect(dashboard).toHaveClass('dashboard-tablet');
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '14px',
      });
    });

    it('should handle dynamic column adjustment', () => {
      // TDD RED PHASE: Test dynamic column adjustment

      // ACT: Render with dynamic columns based on widgets
      const manyWidgetsConfig = {
        ...mockDashboardConfig,
        widgets: Array.from({ length: 8 }, (_, i) => ({
          id: `widget-${i}`,
          type: 'metric' as const,
          title: `Widget ${i}`,
          position: { row: 1, col: i + 1, rowSpan: 1, colSpan: 1 },
          config: { metric: 'revenue' },
        })),
      };

      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} config={manyWidgetsConfig} />,
      );

      // ASSERT: Columns adjusted for widget count
      const dashboard = screen.getByTestId('dashboard-grid');
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      });
    });
  });

  describe('Error Handling and Loading States', () => {
    it('should display loading state correctly', () => {
      // TDD RED PHASE: Test loading state

      // ACT: Render dashboard in loading state
      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} isLoading={true} />,
      );

      // ASSERT: Loading skeleton displayed
      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
      expect(screen.getByLabelText('Carregando dashboard')).toBeInTheDocument();

      // Validate accessibility during loading
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });

    it('should handle dashboard configuration errors', () => {
      // TDD RED PHASE: Test configuration error handling

      // ACT: Render with invalid configuration
      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} config={null} />,
      );

      // ASSERT: Error state displayed
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText('Erro na configuração')).toBeInTheDocument();
      expect(
        screen.getByText('Configuração do dashboard inválida'),
      ).toBeInTheDocument();

      // Validate retry functionality
      const retryButton = screen.getByRole('button', {
        name: 'Tentar novamente',
      });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle individual widget errors gracefully', () => {
      // TDD RED PHASE: Test individual widget error handling

      // ACT: Render dashboard with widget errors
      const errorConfig = {
        ...mockDashboardConfig,
        widgets: [
          {
            ...mockDashboardConfig.widgets[0],
            error: new Error('Widget failed to load'),
          },
        ],
      };

      renderWithQueryClient(
        <MetricsDashboard {...defaultProps} config={errorConfig} />,
      );

      // ASSERT: Widget error state displayed
      const errorWidget = screen.getByTestId('widget-mrr-widget');
      expect(
        within(errorWidget).getByTestId('widget-error'),
      ).toBeInTheDocument();
      expect(
        within(errorWidget).getByText('Erro no widget'),
      ).toBeInTheDocument();

      // Other widgets should still render normally
      expect(screen.getByTestId('widget-arr-widget')).toBeInTheDocument();
    });
  });
});
