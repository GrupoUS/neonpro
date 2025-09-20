/**
 * Component Test: TrendsChart.tsx
 * TDD RED PHASE: These tests MUST FAIL initially
 *
 * Test Coverage:
 * - Chart rendering and data visualization accuracy
 * - Data transformations and chart configuration
 * - Chart interactivity (hover, click, zoom, pan)
 * - Different chart types (line, bar, area, scatter)
 * - Accessibility features for charts (ARIA, keyboard)
 * - Responsive design and mobile chart behavior
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Import component that doesn't exist yet (TDD RED)
import TrendsChart from '../../src/components/financial/TrendsChart';

// Import types that don't exist yet (TDD RED)
import type {
  ChartConfig,
  ChartData,
  ChartType,
  InteractionEvent,
  TrendsChartProps,
} from '../../src/types/financial-charts';

describe('Component: TrendsChart', () => {
  let user: ReturnType<typeof userEvent.setup>;

  // Mock chart data for testing
  const mockChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [45000, 48000, 52000, 49000, 55000, 58000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [25000, 27000, 28000, 26000, 30000, 32000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const mockConfig: ChartConfig = {
    type: 'line',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mês',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
        ticks: {
          callback: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
        },
      },
    },
  };

  const defaultProps: TrendsChartProps = {
    data: mockChartData,
    config: mockConfig,
    width: 800,
    height: 400,
    onDataPointClick: vi.fn(),
    onHover: vi.fn(),
    onZoom: vi.fn(),
    'data-testid': 'trends-chart',
  };

  beforeEach(() => {
    // Setup user event with realistic delays
    user = userEvent.setup({
      delay: null, // Disable delays in tests
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock Canvas API for chart rendering
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    });

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

  describe('Chart Rendering', () => {
    it('should render line chart with data correctly', () => {
      // TDD RED PHASE: Test basic chart rendering

      // ACT: Render line chart component
      render(<TrendsChart {...defaultProps} />);

      // ASSERT: Chart container and canvas exist
      expect(screen.getByTestId('trends-chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-canvas')).toBeInTheDocument();

      // Validate chart accessibility attributes
      const chart = screen.getByTestId('trends-chart');
      expect(chart).toHaveAttribute('role', 'img');
      expect(chart).toHaveAttribute(
        'aria-label',
        'Gráfico de tendências financeiras',
      );

      // Validate canvas dimensions
      const canvas = screen.getByTestId('chart-canvas');
      expect(canvas).toHaveAttribute('width', '800');
      expect(canvas).toHaveAttribute('height', '400');
    });

    it('should render different chart types correctly', () => {
      // TDD RED PHASE: Test chart type variations

      // ACT: Render bar chart
      const barConfig = { ...mockConfig, type: 'bar' as ChartType };
      const { rerender } = render(
        <TrendsChart {...defaultProps} config={barConfig} />,
      );

      // ASSERT: Bar chart rendering
      expect(screen.getByTestId('trends-chart')).toHaveClass('chart-bar');

      // ACT: Change to area chart
      const areaConfig = { ...mockConfig, type: 'area' as ChartType };
      rerender(<TrendsChart {...defaultProps} config={areaConfig} />);

      // ASSERT: Area chart rendering
      expect(screen.getByTestId('trends-chart')).toHaveClass('chart-area');

      // ACT: Change to scatter chart
      const scatterConfig = { ...mockConfig, type: 'scatter' as ChartType };
      rerender(<TrendsChart {...defaultProps} config={scatterConfig} />);

      // ASSERT: Scatter chart rendering
      expect(screen.getByTestId('trends-chart')).toHaveClass('chart-scatter');
    });

    it('should handle empty or invalid data gracefully', () => {
      // TDD RED PHASE: Test empty data handling

      // ACT: Render with empty data
      const emptyData = { labels: [], datasets: [] };
      render(<TrendsChart {...defaultProps} data={emptyData} />);

      // ASSERT: Empty state displayed
      expect(screen.getByTestId('chart-empty-state')).toBeInTheDocument();
      expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
      expect(
        screen.getByText('Não há dados disponíveis para este gráfico'),
      ).toBeInTheDocument();

      // Validate empty state accessibility
      const emptyState = screen.getByTestId('chart-empty-state');
      expect(emptyState).toHaveAttribute('role', 'status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });

    it('should handle loading state correctly', () => {
      // TDD RED PHASE: Test loading state

      // ACT: Render in loading state
      render(<TrendsChart {...defaultProps} isLoading={true} />);

      // ASSERT: Loading skeleton displayed
      expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
      expect(screen.getByLabelText('Carregando gráfico')).toBeInTheDocument();

      // Validate loading accessibility
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Data Transformations', () => {
    it('should format currency values correctly', () => {
      // TDD RED PHASE: Test data formatting

      // ACT: Render chart with currency data
      render(<TrendsChart {...defaultProps} />);

      // ASSERT: Currency formatting in tooltips and labels
      const chart = screen.getByTestId('trends-chart');

      // Simulate hover to show tooltip
      fireEvent.mouseMove(chart, { clientX: 100, clientY: 100 });

      // Validate currency formatting in tooltip
      expect(screen.getByText('R$ 45.000')).toBeInTheDocument();

      // Validate Y-axis labels have currency format
      expect(screen.getByText(/R\$ \d+\.\d+/)).toBeInTheDocument();
    });

    it('should handle percentage data correctly', () => {
      // TDD RED PHASE: Test percentage data handling

      // ACT: Render with percentage data
      const percentageData = {
        ...mockChartData,
        datasets: [
          {
            label: 'Growth Rate',
            data: [12.5, 15.2, 8.7, 22.1, 18.9, 14.3],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            format: 'percentage',
          },
        ],
      };

      render(<TrendsChart {...defaultProps} data={percentageData} />);

      // ASSERT: Percentage formatting
      const chart = screen.getByTestId('trends-chart');
      fireEvent.mouseMove(chart, { clientX: 150, clientY: 100 });

      expect(screen.getByText('12,5%')).toBeInTheDocument();
    });

    it('should aggregate data correctly for different time periods', () => {
      // TDD RED PHASE: Test data aggregation

      // ACT: Render with monthly aggregation
      const monthlyConfig = {
        ...mockConfig,
        aggregation: 'monthly',
        period: '12_months',
      };

      render(<TrendsChart {...defaultProps} config={monthlyConfig} />);

      // ASSERT: Monthly aggregation applied
      expect(screen.getByTestId('trends-chart')).toHaveAttribute(
        'data-aggregation',
        'monthly',
      );

      // Validate aggregated data points
      const dataPoints = screen.getAllByTestId(/data-point-\d+/);
      expect(dataPoints).toHaveLength(6); // 6 months of data
    });
  });

  describe('Chart Interactivity', () => {
    it('should handle data point click events', async () => {
      // TDD RED PHASE: Test click interactions

      // ACT: Render chart and click on data point
      render(<TrendsChart {...defaultProps} />);

      const chart = screen.getByTestId('trends-chart');
      await user.click(chart);

      // ASSERT: Click callback called
      expect(defaultProps.onDataPointClick).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDataPointClick).toHaveBeenCalledWith(
        expect.objectContaining({
          datasetIndex: expect.any(Number),
          index: expect.any(Number),
          value: expect.any(Number),
        }),
      );
    });

    it('should handle hover interactions correctly', async () => {
      // TDD RED PHASE: Test hover interactions

      // ACT: Render chart and hover over data point
      render(<TrendsChart {...defaultProps} />);

      const chart = screen.getByTestId('trends-chart');
      await user.hover(chart);

      // ASSERT: Hover callback called
      expect(defaultProps.onHover).toHaveBeenCalledTimes(1);

      // Validate tooltip appears
      await waitFor(() => {
        expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
      });

      const tooltip = screen.getByTestId('chart-tooltip');
      expect(tooltip).toHaveAttribute('role', 'tooltip');
      expect(tooltip).toHaveTextContent('Revenue: R$ 45.000');
    });

    it('should support zoom and pan functionality', async () => {
      // TDD RED PHASE: Test zoom and pan

      // ACT: Render chart with zoom enabled
      const zoomConfig = {
        ...mockConfig,
        plugins: {
          zoom: {
            pan: { enabled: true },
            zoom: { enabled: true, wheel: { enabled: true } },
          },
        },
      };

      render(<TrendsChart {...defaultProps} config={zoomConfig} />);

      const chart = screen.getByTestId('trends-chart');

      // Simulate wheel zoom
      fireEvent.wheel(chart, { deltaY: -100 });

      // ASSERT: Zoom callback called
      expect(defaultProps.onZoom).toHaveBeenCalledTimes(1);
      expect(defaultProps.onZoom).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'zoom',
          scale: expect.any(Number),
        }),
      );
    });

    it('should handle keyboard navigation', async () => {
      // TDD RED PHASE: Test keyboard interaction

      // ACT: Render chart and use keyboard navigation
      render(<TrendsChart {...defaultProps} />);

      const chart = screen.getByTestId('trends-chart');

      // Focus the chart
      await user.tab();
      expect(chart).toHaveFocus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('data-point-highlight')).toHaveAttribute(
        'data-index',
        '1',
      );

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByTestId('data-point-highlight')).toHaveAttribute(
        'data-index',
        '0',
      );

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(defaultProps.onDataPointClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should meet accessibility standards for data visualization', async () => {
      // TDD RED PHASE: Test chart accessibility

      // ACT: Render chart
      const { container } = render(<TrendsChart {...defaultProps} />);

      // ASSERT: No accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Validate chart ARIA structure
      const chart = screen.getByTestId('trends-chart');
      expect(chart).toHaveAttribute('role', 'img');
      expect(chart).toHaveAttribute('aria-label');
      expect(chart).toHaveAttribute('tabindex', '0');
    });

    it('should provide comprehensive screen reader support', () => {
      // TDD RED PHASE: Test screen reader accessibility

      // ACT: Render chart
      render(<TrendsChart {...defaultProps} />);

      // ASSERT: Screen reader description
      const description = screen.getByTestId('chart-sr-description');
      expect(description).toHaveClass('sr-only');
      expect(description).toHaveTextContent(/gráfico de linha mostrando/i);

      // Validate data table alternative
      const dataTable = screen.getByTestId('chart-data-table');
      expect(dataTable).toHaveClass('sr-only');
      expect(dataTable).toHaveAttribute(
        'aria-label',
        'Dados do gráfico em formato de tabela',
      );

      // Validate table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3); // Month, Revenue, Expenses
      expect(screen.getAllByRole('row')).toHaveLength(7); // Header + 6 data rows
    });

    it('should support high contrast mode', () => {
      // TDD RED PHASE: Test high contrast support

      // ACT: Render chart in high contrast mode
      render(<TrendsChart {...defaultProps} theme='high-contrast' />);

      // ASSERT: High contrast colors applied
      const chart = screen.getByTestId('trends-chart');
      expect(chart).toHaveClass('chart-high-contrast');

      // Validate contrast ratios meet WCAG standards
      const canvas = screen.getByTestId('chart-canvas');
      expect(canvas).toHaveStyle({ filter: 'contrast(1.5)' });
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

      render(<TrendsChart {...defaultProps} />);

      // ASSERT: Mobile layout applied
      const chart = screen.getByTestId('trends-chart');
      expect(chart).toHaveClass('chart-mobile');

      // Validate mobile-specific configurations
      const canvas = screen.getByTestId('chart-canvas');
      expect(canvas).toHaveAttribute('width', '375');
      expect(canvas).toHaveAttribute('height', '250'); // Adjusted for mobile

      // Validate simplified mobile interactions
      expect(chart).toHaveAttribute('data-mobile-gestures', 'true');
    });

    it('should handle dynamic resizing correctly', () => {
      // TDD RED PHASE: Test dynamic resize behavior

      // ACT: Render chart and simulate resize
      const { rerender } = render(<TrendsChart {...defaultProps} />);

      // Initial size
      expect(screen.getByTestId('chart-canvas')).toHaveAttribute(
        'width',
        '800',
      );

      // Simulate resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      // Trigger resize event
      fireEvent.resize(window);

      // ASSERT: Chart resized
      rerender(<TrendsChart {...defaultProps} width={1200} />);
      expect(screen.getByTestId('chart-canvas')).toHaveAttribute(
        'width',
        '1200',
      );
    });

    it('should maintain aspect ratio on different screen sizes', () => {
      // TDD RED PHASE: Test aspect ratio maintenance

      // ACT: Render chart with aspect ratio constraints
      const aspectRatioConfig = {
        ...mockConfig,
        maintainAspectRatio: true,
        aspectRatio: 2,
      };

      render(<TrendsChart {...defaultProps} config={aspectRatioConfig} />);

      // ASSERT: Aspect ratio maintained
      const canvas = screen.getByTestId('chart-canvas');
      const width = parseInt(canvas.getAttribute('width') || '0');
      const height = parseInt(canvas.getAttribute('height') || '0');

      expect(width / height).toBeCloseTo(2, 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', () => {
      // TDD RED PHASE: Test error boundaries

      // ACT: Render with invalid data that causes rendering error
      const invalidData = {
        labels: null,
        datasets: [{ data: 'invalid' }],
      } as any;

      render(<TrendsChart {...defaultProps} data={invalidData} />);

      // ASSERT: Error state displayed
      expect(screen.getByTestId('chart-error')).toBeInTheDocument();
      expect(
        screen.getByText('Erro ao renderizar gráfico'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Os dados fornecidos são inválidos'),
      ).toBeInTheDocument();

      // Validate retry functionality
      const retryButton = screen.getByRole('button', {
        name: 'Tentar novamente',
      });
      expect(retryButton).toBeInTheDocument();
    });

    it('should validate data format and show appropriate errors', () => {
      // TDD RED PHASE: Test data validation

      // ACT: Render with mismatched data format
      const mismatchedData = {
        labels: ['A', 'B'],
        datasets: [
          {
            label: 'Dataset',
            data: [1, 2, 3, 4], // More data points than labels
          },
        ],
      };

      render(<TrendsChart {...defaultProps} data={mismatchedData} />);

      // ASSERT: Validation error displayed
      expect(screen.getByTestId('chart-validation-error')).toBeInTheDocument();
      expect(screen.getByText('Dados inconsistentes')).toBeInTheDocument();
      expect(
        screen.getByText(/número de rótulos não corresponde/i),
      ).toBeInTheDocument();
    });

    it('should handle canvas rendering failures', () => {
      // TDD RED PHASE: Test canvas fallback

      // ACT: Mock canvas failure
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      render(<TrendsChart {...defaultProps} />);

      // ASSERT: Canvas fallback displayed
      expect(screen.getByTestId('chart-canvas-fallback')).toBeInTheDocument();
      expect(screen.getByText('Canvas não suportado')).toBeInTheDocument();

      // Validate fallback data table
      expect(screen.getByTestId('chart-fallback-table')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
