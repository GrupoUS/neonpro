/**
 * Component Test: FinancialWidget.tsx
 * TDD RED PHASE: These tests MUST FAIL initially
 *
 * Test Coverage:
 * - Component rendering and mounting
 * - Props validation and default values
 * - Accessibility features (WCAG 2.1 AA)
 * - User interactions and state management
 * - Error states and edge cases
 * - Responsive design and mobile compatibility
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Import component that doesn't exist yet (TDD RED)
import FinancialWidget from '../../src/components/financial/FinancialWidget';

// Import types that don't exist yet (TDD RED)
import type { FinancialMetric, FinancialWidgetProps } from '../../src/types/financial';

describe('Component: FinancialWidget', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  // Mock financial data for testing
  const mockMetric: FinancialMetric = {
    id: 'mrr',
    label: 'Monthly Recurring Revenue',
    value: 125000,
    currency: 'BRL',
    change: 12.5,
    changeType: 'increase',
    period: 'monthly',
    lastUpdated: '2024-09-20T00:00:00Z',
    trend: 'up',
    percentage: 15.2,
  };

  const defaultProps: FinancialWidgetProps = {
    metric: mockMetric,
    size: 'medium',
    showTrend: true,
    showPercentage: true,
    isLoading: false,
    onRefresh: vi.fn(),
    'data-testid': 'financial-widget',
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderWithQueryClient = (
    ui: React.ReactElement,
    options: { props?: Partial<FinancialWidgetProps> } = {},
  ) => {
    const mergedProps = { ...defaultProps, ...options.props };

    return render(
      <QueryClientProvider client={queryClient}>
        {React.cloneElement(ui, mergedProps)}
      </QueryClientProvider>,
    );
  };

  describe('Component Rendering', () => {
    it('should render financial widget with basic metric data', () => {
      // TDD RED PHASE: Test basic component rendering

      // ACT: Render component with mock data
      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      // ASSERT: Component should render with metric data
      expect(screen.getByTestId('financial-widget')).toBeInTheDocument();
      expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument();
      expect(screen.getByText('R$ 125.000,00')).toBeInTheDocument();
      expect(screen.getByText('+12,5%')).toBeInTheDocument();

      // Validate trend indicator
      expect(screen.getByLabelText('Tendência crescente')).toBeInTheDocument();

      // Validate currency formatting (Brazilian Real)
      const valueElement = screen.getByText('R$ 125.000,00');
      expect(valueElement).toHaveAttribute(
        'aria-label',
        'Valor: 125 mil reais',
      );
    });

    it('should render different widget sizes correctly', () => {
      // TDD RED PHASE: Test component size variations

      // ACT: Render small size widget
      const { rerender } = renderWithQueryClient(
        <FinancialWidget {...defaultProps} size='small' />,
      );

      // ASSERT: Small size styling applied
      const widget = screen.getByTestId('financial-widget');
      expect(widget).toHaveClass('financial-widget--small');
      expect(widget).toHaveStyle({ minHeight: '120px' });

      // ACT: Change to large size
      rerender(
        <QueryClientProvider client={queryClient}>
          <FinancialWidget {...defaultProps} size='large' />
        </QueryClientProvider>,
      );

      // ASSERT: Large size styling applied
      expect(widget).toHaveClass('financial-widget--large');
      expect(widget).toHaveStyle({ minHeight: '200px' });
    });

    it('should handle loading state appropriately', () => {
      // TDD RED PHASE: Test loading state rendering

      // ACT: Render component in loading state
      renderWithQueryClient(
        <FinancialWidget {...defaultProps} isLoading={true} />,
      );

      // ASSERT: Loading skeleton should be displayed
      expect(
        screen.getByTestId('financial-widget-skeleton'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Carregando dados financeiros'),
      ).toBeInTheDocument();

      // Validate accessibility during loading
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');

      // Ensure actual data is not rendered during loading
      expect(
        screen.queryByText('Monthly Recurring Revenue'),
      ).not.toBeInTheDocument();
    });

    it('should handle empty or invalid metric data', () => {
      // TDD RED PHASE: Test error and empty states

      // ACT: Render with null metric
      renderWithQueryClient(
        <FinancialWidget {...defaultProps} metric={null} />,
      );

      // ASSERT: Empty state should be displayed
      expect(screen.getByTestId('financial-widget-empty')).toBeInTheDocument();
      expect(screen.getByText('Dados indisponíveis')).toBeInTheDocument();
      expect(
        screen.getByText('Não foi possível carregar os dados financeiros'),
      ).toBeInTheDocument();

      // Validate retry button availability
      const retryButton = screen.getByRole('button', {
        name: 'Tentar novamente',
      });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should meet accessibility standards', async () => {
      // TDD RED PHASE: Test accessibility compliance

      // ACT: Render component
      const { container } = renderWithQueryClient(
        <FinancialWidget {...defaultProps} />,
      );

      // ASSERT: No accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Validate ARIA attributes
      const widget = screen.getByTestId('financial-widget');
      expect(widget).toHaveAttribute('role', 'article');
      expect(widget).toHaveAttribute(
        'aria-label',
        'Widget financeiro: Monthly Recurring Revenue',
      );

      // Validate semantic structure
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByText('Monthly Recurring Revenue')).toHaveAttribute(
        'id',
      );

      // Validate keyboard navigation
      expect(widget).toHaveAttribute('tabindex', '0');
    });

    it('should support keyboard navigation and focus management', async () => {
      // TDD RED PHASE: Test keyboard accessibility

      // ACT: Render component and focus
      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      const widget = screen.getByTestId('financial-widget');
      const refreshButton = screen.getByRole('button', {
        name: 'Atualizar dados',
      });

      // ASSERT: Keyboard navigation works
      await user.tab();
      expect(widget).toHaveFocus();

      await user.tab();
      expect(refreshButton).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);

      // Test Space key activation
      await user.keyboard(' ');
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(2);
    });

    it('should provide appropriate screen reader announcements', () => {
      // TDD RED PHASE: Test screen reader support

      // ACT: Render component with metric changes
      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      // ASSERT: Screen reader announcements
      const announcement = screen.getByLabelText(/Receita recorrente mensal/);
      expect(announcement).toHaveAttribute('aria-live', 'polite');

      // Validate value announcement format
      const valueAnnouncement = screen.getByLabelText('Valor: 125 mil reais');
      expect(valueAnnouncement).toBeInTheDocument();

      // Validate change announcement
      const changeAnnouncement = screen.getByLabelText('Aumento de 12,5%');
      expect(changeAnnouncement).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh button click correctly', async () => {
      // TDD RED PHASE: Test refresh functionality

      // ACT: Render component and click refresh
      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      const refreshButton = screen.getByRole('button', {
        name: 'Atualizar dados',
      });
      await user.click(refreshButton);

      // ASSERT: Refresh callback called
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
      expect(defaultProps.onRefresh).toHaveBeenCalledWith('mrr');

      // Validate loading state during refresh
      expect(refreshButton).toBeDisabled();
      expect(refreshButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should handle metric expansion and collapse', async () => {
      // TDD RED PHASE: Test expandable details

      // ACT: Render component with expandable details
      renderWithQueryClient(
        <FinancialWidget {...defaultProps} expandable={true} />,
      );

      const expandButton = screen.getByRole('button', { name: 'Ver detalhes' });

      // ASSERT: Initially collapsed
      expect(screen.queryByTestId('metric-details')).not.toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      // ACT: Expand details
      await user.click(expandButton);

      // ASSERT: Details expanded
      expect(screen.getByTestId('metric-details')).toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      expect(expandButton).toHaveTextContent('Ocultar detalhes');

      // Validate detailed information
      expect(screen.getByText('Última atualização:')).toBeInTheDocument();
      expect(screen.getByText('Tendência:')).toBeInTheDocument();
      expect(screen.getByText('Período:')).toBeInTheDocument();
    });

    it('should handle tooltip interactions', async () => {
      // TDD RED PHASE: Test tooltip functionality

      // ACT: Render component with tooltips enabled
      renderWithQueryClient(
        <FinancialWidget {...defaultProps} showTooltip={true} />,
      );

      const infoIcon = screen.getByRole('button', {
        name: 'Informações sobre a métrica',
      });

      // ASSERT: Tooltip initially hidden
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // ACT: Hover over info icon
      await user.hover(infoIcon);

      // ASSERT: Tooltip appears
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(
        'Receita recorrente mensal calculada com base nos planos ativos',
      );

      // ACT: Unhover
      await user.unhover(infoIcon);

      // ASSERT: Tooltip disappears
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should handle prop changes and re-render correctly', () => {
      // TDD RED PHASE: Test prop updates

      // ACT: Initial render
      const { rerender } = renderWithQueryClient(
        <FinancialWidget {...defaultProps} />,
      );

      expect(screen.getByText('R$ 125.000,00')).toBeInTheDocument();

      // ACT: Update metric value
      const updatedMetric = {
        ...mockMetric,
        value: 150000,
        change: 20.0,
        changeType: 'increase' as const,
      };

      rerender(
        <QueryClientProvider client={queryClient}>
          <FinancialWidget {...defaultProps} metric={updatedMetric} />
        </QueryClientProvider>,
      );

      // ASSERT: Component updates with new values
      expect(screen.getByText('R$ 150.000,00')).toBeInTheDocument();
      expect(screen.getByText('+20,0%')).toBeInTheDocument();
    });

    it('should handle error states gracefully', () => {
      // TDD RED PHASE: Test error handling

      // ACT: Render component with error state
      renderWithQueryClient(
        <FinancialWidget
          {...defaultProps}
          error={new Error('Falha ao carregar dados')}
          isLoading={false}
        />,
      );

      // ASSERT: Error state displayed
      expect(screen.getByTestId('financial-widget-error')).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
      expect(screen.getByText('Falha ao carregar dados')).toBeInTheDocument();

      // Validate error icon and retry functionality
      expect(screen.getByLabelText('Erro')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', {
        name: 'Tentar novamente',
      });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
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

      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      // ASSERT: Mobile layout applied
      const widget = screen.getByTestId('financial-widget');
      expect(widget).toHaveClass('financial-widget--mobile');

      // Validate mobile-specific styling
      expect(widget).toHaveStyle({ padding: '12px' });

      // Ensure text remains readable on mobile
      const valueText = screen.getByText('R$ 125.000,00');
      expect(valueText).toHaveStyle({ fontSize: '1.25rem' });
    });

    it('should handle tablet viewport correctly', () => {
      // TDD RED PHASE: Test tablet responsiveness

      // ACT: Set tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithQueryClient(<FinancialWidget {...defaultProps} />);

      // ASSERT: Tablet layout applied
      const widget = screen.getByTestId('financial-widget');
      expect(widget).toHaveClass('financial-widget--tablet');

      // Validate touch-friendly interactions
      const refreshButton = screen.getByRole('button', {
        name: 'Atualizar dados',
      });
      expect(refreshButton).toHaveStyle({ minHeight: '44px' });
    });
  });
});
