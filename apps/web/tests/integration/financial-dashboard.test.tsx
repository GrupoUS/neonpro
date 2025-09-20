/**
 * Integration Test: Financial Dashboard
 * TDD RED PHASE: These tests MUST FAIL initially
 *
 * Test Coverage:
 * - Complete dashboard component hierarchy and integration
 * - Data synchronization between multiple dashboard widgets
 * - User workflows and interaction patterns (filtering, sorting, actions)
 * - Dashboard performance and loading states
 * - Responsive behavior and mobile dashboard optimization
 * - Accessibility features across dashboard components
 */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Import dashboard components that don't exist yet (TDD RED)
import { DashboardFilters } from '../../src/components/financial/DashboardFilters';
import { DashboardHeader } from '../../src/components/financial/DashboardHeader';
import { DashboardSidebar } from '../../src/components/financial/DashboardSidebar';
import { DashboardWidget } from '../../src/components/financial/DashboardWidget';
import { FinancialDashboard } from '../../src/components/financial/FinancialDashboard';
import { FinancialDashboardLayout } from '../../src/components/financial/FinancialDashboardLayout';

// Import widget components that don't exist yet (TDD RED)
import { ExpenseWidget } from '../../src/components/financial/widgets/ExpenseWidget';
import { MetricsWidget } from '../../src/components/financial/widgets/MetricsWidget';
import { ProfitWidget } from '../../src/components/financial/widgets/ProfitWidget';
import { QuickActionsWidget } from '../../src/components/financial/widgets/QuickActionsWidget';
import { RevenueWidget } from '../../src/components/financial/widgets/RevenueWidget';
import { TransactionListWidget } from '../../src/components/financial/widgets/TransactionListWidget';
import { TrendsChartWidget } from '../../src/components/financial/widgets/TrendsChartWidget';

// Import providers and context that don't exist yet (TDD RED)
import { DashboardContext } from '../../src/context/DashboardContext';
import { FinancialDataContext } from '../../src/context/FinancialDataContext';
import { FinancialDashboardProvider } from '../../src/providers/FinancialDashboardProvider';

// Import services that don't exist yet (TDD RED)
import { dashboardCacheService } from '../../src/services/dashboard-cache-service';
import { dashboardConfigService } from '../../src/services/dashboard-config-service';
import { dashboardLayoutService } from '../../src/services/dashboard-layout-service';

// Import types that don't exist yet (TDD RED)
import type {
  DashboardConfig,
  DashboardFilters as DashboardFiltersType,
  DashboardLayout,
  DashboardPermissions,
  DashboardTheme,
  DashboardWidget as DashboardWidgetType,
  UserPreferences,
  WidgetPosition,
} from '../../src/types/financial-dashboard';

describe('Integration: Financial Dashboard', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockServer: ReturnType<typeof setupServer>;

  // Mock dashboard configuration
  const mockDashboardConfig: DashboardConfig = {
    id: 'default-financial-dashboard',
    name: 'Financial Dashboard',
    clinicId: 'clinic-123',
    layout: 'grid',
    theme: 'light',
    widgets: [
      {
        id: 'revenue-widget',
        type: 'revenue',
        position: { x: 0, y: 0, width: 4, height: 2 },
        config: { showGrowth: true, period: 'monthly' },
        permissions: { view: true, edit: true },
      },
      {
        id: 'expense-widget',
        type: 'expense',
        position: { x: 4, y: 0, width: 4, height: 2 },
        config: { showCategories: true, period: 'monthly' },
        permissions: { view: true, edit: true },
      },
      {
        id: 'profit-widget',
        type: 'profit',
        position: { x: 8, y: 0, width: 4, height: 2 },
        config: { showMargin: true, period: 'monthly' },
        permissions: { view: true, edit: true },
      },
      {
        id: 'transactions-widget',
        type: 'transactions',
        position: { x: 0, y: 2, width: 6, height: 4 },
        config: { limit: 10, showFilters: true },
        permissions: { view: true, edit: true },
      },
      {
        id: 'trends-chart-widget',
        type: 'trends-chart',
        position: { x: 6, y: 2, width: 6, height: 4 },
        config: { chartType: 'line', period: '6_months' },
        permissions: { view: true, edit: true },
      },
      {
        id: 'metrics-widget',
        type: 'metrics',
        position: { x: 0, y: 6, width: 8, height: 3 },
        config: { showComparison: true, period: 'monthly' },
        permissions: { view: true, edit: true },
      },
      {
        id: 'quick-actions-widget',
        type: 'quick-actions',
        position: { x: 8, y: 6, width: 4, height: 3 },
        config: {
          actions: ['add-transaction', 'generate-report', 'export-data'],
        },
        permissions: { view: true, edit: true },
      },
    ],
    filters: {
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      categories: [],
      transactionTypes: ['revenue', 'expense'],
      amountRange: { min: 0, max: null },
    },
    permissions: {
      view: true,
      edit: true,
      delete: false,
      export: true,
      share: true,
    },
    userPreferences: {
      autoRefresh: true,
      refreshInterval: 30000,
      showTooltips: true,
      compactMode: false,
      notifications: true,
    },
  };

  beforeAll(async () => {
    // Setup mock server for dashboard API
    mockServer = setupServer(
      // Dashboard configuration
      http.get('/api/v1/dashboard/config/:clinicId', ({ params }) => {
        return HttpResponse.json({
          success: true,
          data: { ...mockDashboardConfig, clinicId: params.clinicId },
        });
      }),
      http.put('/api/v1/dashboard/config/:clinicId', async ({ request }) => {
        const config = (await request.json()) as DashboardConfig;
        return HttpResponse.json({
          success: true,
          data: { ...config, lastUpdated: new Date().toISOString() },
        });
      }),
      // Widget data endpoints
      http.get('/api/v1/dashboard/widget/:widgetId/data', ({ params }) => {
        const widgetData = {
          'revenue-widget': {
            current: 125000,
            previous: 108500,
            growth: 15.2,
            trend: 'up',
          },
          'expense-widget': {
            current: 85000,
            previous: 82000,
            growth: 3.7,
            categories: {
              salaries: 45000,
              equipment: 15000,
              utilities: 8000,
              supplies: 12000,
              other: 5000,
            },
          },
          'profit-widget': {
            current: 40000,
            previous: 26500,
            margin: 32.0,
            trend: 'up',
          },
        };

        return HttpResponse.json({
          success: true,
          data: widgetData[params.widgetId as string] || {},
        });
      }),
      // Layout operations
      http.post('/api/v1/dashboard/layout/save', async ({ request }) => {
        const layout = await request.json();
        return HttpResponse.json({
          success: true,
          data: { ...layout, savedAt: new Date().toISOString() },
        });
      }),
    );

    mockServer.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    mockServer.close();
  });

  beforeEach(() => {
    // Setup user event
    user = userEvent.setup({ delay: null });

    // Clear dashboard cache
    dashboardCacheService.clear();

    // Reset layout service
    dashboardLayoutService.reset();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock window resize observer
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

  describe('Dashboard Component Integration', () => {
    it('should render complete dashboard with all widgets', async () => {
      // TDD RED PHASE: Test complete dashboard rendering and integration

      // ACT: Render complete financial dashboard
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: Dashboard structure rendered
      expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();

      // Wait for widgets to load
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('dashboard-loading'),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // ASSERT: All widgets are rendered
      expect(screen.getByTestId('revenue-widget')).toBeInTheDocument();
      expect(screen.getByTestId('expense-widget')).toBeInTheDocument();
      expect(screen.getByTestId('profit-widget')).toBeInTheDocument();
      expect(screen.getByTestId('transactions-widget')).toBeInTheDocument();
      expect(screen.getByTestId('trends-chart-widget')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-widget')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions-widget')).toBeInTheDocument();

      // ASSERT: Widget positioning is correct
      const revenueWidget = screen.getByTestId('revenue-widget');
      expect(revenueWidget).toHaveStyle({
        gridColumn: 'span 4',
        gridRow: 'span 2',
      });
    });

    it('should handle widget loading states correctly', async () => {
      // TDD RED PHASE: Test widget loading state management

      // ACT: Render dashboard with slow loading widgets
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: Initial loading states
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

      // Individual widget loading states
      expect(screen.getByTestId('revenue-widget-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('expense-widget-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('profit-widget-skeleton')).toBeInTheDocument();

      // Wait for widgets to finish loading
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('dashboard-loading'),
          ).not.toBeInTheDocument();
          expect(
            screen.queryByTestId('revenue-widget-skeleton'),
          ).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // ASSERT: Widgets loaded with data
      expect(screen.getByTestId('revenue-current-value')).toHaveTextContent(
        'R$ 125.000',
      );
      expect(screen.getByTestId('expense-current-value')).toHaveTextContent(
        'R$ 85.000',
      );
      expect(screen.getByTestId('profit-current-value')).toHaveTextContent(
        'R$ 40.000',
      );
    });

    it('should handle widget error states gracefully', async () => {
      // TDD RED PHASE: Test widget error handling

      // ARRANGE: Setup server to return errors for specific widgets
      mockServer.use(
        http.get('/api/v1/dashboard/widget/revenue-widget/data', () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to load revenue data' },
            { status: 500 },
          );
        }),
      );

      // ACT: Render dashboard
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId('dashboard-loading'),
        ).not.toBeInTheDocument();
      });

      // ASSERT: Error state displayed for failed widget
      expect(screen.getByTestId('revenue-widget-error')).toBeInTheDocument();
      expect(
        screen.getByText('Erro ao carregar dados de receita'),
      ).toBeInTheDocument();

      // Retry button available
      const retryButton = screen.getByTestId('revenue-widget-retry');
      expect(retryButton).toBeInTheDocument();

      // Other widgets should load successfully
      expect(screen.getByTestId('expense-widget')).toBeInTheDocument();
      expect(
        screen.queryByTestId('expense-widget-error'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Data Synchronization Between Widgets', () => {
    it('should synchronize data updates across related widgets', async () => {
      // TDD RED PHASE: Test data synchronization between widgets

      // ACT: Render dashboard and wait for initial load
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('revenue-current-value')).toHaveTextContent(
          'R$ 125.000',
        );
      });

      // ACT: Update revenue in one widget
      const editRevenueButton = screen.getByTestId('edit-revenue-button');
      await user.click(editRevenueButton);

      const revenueInput = screen.getByTestId('revenue-input');
      await user.clear(revenueInput);
      await user.type(revenueInput, '135000');

      const saveButton = screen.getByTestId('save-revenue-button');
      await user.click(saveButton);

      // ASSERT: Revenue widget updated
      await waitFor(() => {
        expect(screen.getByTestId('revenue-current-value')).toHaveTextContent(
          'R$ 135.000',
        );
      });

      // ASSERT: Related widgets synchronized
      // Profit widget should update (profit = revenue - expenses)
      await waitFor(() => {
        expect(screen.getByTestId('profit-current-value')).toHaveTextContent(
          'R$ 50.000',
        );
      });

      // Metrics widget should update with new calculations
      expect(screen.getByTestId('metrics-profit-margin')).toHaveTextContent(
        '37,0%',
      );

      // Trends chart should reflect new data point
      expect(screen.getByTestId('trends-chart')).toHaveAttribute(
        'data-updated',
        'true',
      );
    });

    it('should handle filter changes affecting multiple widgets', async () => {
      // TDD RED PHASE: Test filter synchronization across widgets

      // ACT: Render dashboard
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Change date range filter
      const dateRangeFilter = screen.getByTestId('date-range-filter');
      await user.selectOptions(dateRangeFilter, 'quarterly');

      // ASSERT: All widgets show loading state during re-fetch
      expect(screen.getByTestId('revenue-widget-loading')).toBeInTheDocument();
      expect(screen.getByTestId('expense-widget-loading')).toBeInTheDocument();
      expect(
        screen.getByTestId('transactions-widget-loading'),
      ).toBeInTheDocument();

      // Wait for updates to complete
      await waitFor(() => {
        expect(
          screen.queryByTestId('revenue-widget-loading'),
        ).not.toBeInTheDocument();
      });

      // ASSERT: All widgets updated with quarterly data
      expect(screen.getByTestId('revenue-period-label')).toHaveTextContent(
        'Trimestral',
      );
      expect(screen.getByTestId('expense-period-label')).toHaveTextContent(
        'Trimestral',
      );
      expect(screen.getByTestId('transactions-period-label')).toHaveTextContent(
        'Trimestral',
      );
    });

    it('should maintain data consistency during concurrent updates', async () => {
      // TDD RED PHASE: Test concurrent data update handling

      // ACT: Render dashboard
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Trigger multiple concurrent updates
      const addTransactionButton = screen.getByTestId('add-transaction-button');
      const updateExpenseButton = screen.getByTestId('update-expense-button');

      // Trigger both updates simultaneously
      await Promise.all([
        user.click(addTransactionButton),
        user.click(updateExpenseButton),
      ]);

      // Fill forms simultaneously
      await user.type(screen.getByTestId('transaction-amount'), '2500');
      await user.type(screen.getByTestId('expense-amount'), '88000');

      // Submit both forms
      await Promise.all([
        user.click(screen.getByTestId('save-transaction')),
        user.click(screen.getByTestId('save-expense')),
      ]);

      // ASSERT: Data consistency maintained
      await waitFor(() => {
        // Transaction added to list
        expect(screen.getByText('R$ 2.500')).toBeInTheDocument();

        // Expense updated
        expect(screen.getByTestId('expense-current-value')).toHaveTextContent(
          'R$ 88.000',
        );

        // Profit recalculated correctly (125000 - 88000 = 37000)
        expect(screen.getByTestId('profit-current-value')).toHaveTextContent(
          'R$ 37.000',
        );
      });
    });
  });

  describe('User Workflows and Interactions', () => {
    it('should handle complete add transaction workflow', async () => {
      // TDD RED PHASE: Test user workflow for adding transactions

      // ACT: Render dashboard and start transaction workflow
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // Step 1: Open transaction form
      const addTransactionButton = screen.getByTestId('add-transaction-button');
      await user.click(addTransactionButton);

      // ASSERT: Form modal opened
      expect(screen.getByTestId('transaction-form-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-label',
        'Adicionar transação',
      );

      // Step 2: Fill transaction form
      await user.type(screen.getByTestId('transaction-amount'), '3500');
      await user.type(
        screen.getByTestId('transaction-description'),
        'Consulta especializada',
      );
      await user.selectOptions(
        screen.getByTestId('transaction-category'),
        'consultation',
      );
      await user.selectOptions(
        screen.getByTestId('transaction-type'),
        'revenue',
      );

      // Step 3: Submit form
      const submitButton = screen.getByTestId('submit-transaction');
      await user.click(submitButton);

      // ASSERT: Transaction added successfully
      await waitFor(() => {
        expect(
          screen.queryByTestId('transaction-form-modal'),
        ).not.toBeInTheDocument();
      });

      // Verify transaction appears in list
      expect(screen.getByText('Consulta especializada')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.500')).toBeInTheDocument();

      // Verify metrics updated
      await waitFor(() => {
        expect(screen.getByTestId('revenue-current-value')).toHaveTextContent(
          'R$ 128.500',
        );
      });
    });

    it('should handle dashboard customization workflow', async () => {
      // TDD RED PHASE: Test dashboard customization user workflow

      // ACT: Render dashboard and enter customization mode
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // Step 1: Enable edit mode
      const editModeButton = screen.getByTestId('dashboard-edit-mode');
      await user.click(editModeButton);

      // ASSERT: Edit mode activated
      expect(screen.getByTestId('financial-dashboard')).toHaveClass(
        'edit-mode',
      );
      expect(screen.getByTestId('edit-mode-toolbar')).toBeInTheDocument();

      // Step 2: Resize widget
      const revenueWidget = screen.getByTestId('revenue-widget');
      const resizeHandle = within(revenueWidget).getByTestId('resize-handle');

      await user.pointer([
        { keys: '[MouseLeft>]', target: resizeHandle },
        { coords: { x: 50, y: 0 } },
        { keys: '[/MouseLeft]' },
      ]);

      // ASSERT: Widget resized
      expect(revenueWidget).toHaveStyle({ gridColumn: 'span 6' });

      // Step 3: Move widget
      const dragHandle = within(revenueWidget).getByTestId('drag-handle');
      await user.pointer([
        { keys: '[MouseLeft>]', target: dragHandle },
        { coords: { x: 0, y: 100 } },
        { keys: '[/MouseLeft]' },
      ]);

      // Step 4: Save layout
      const saveLayoutButton = screen.getByTestId('save-layout-button');
      await user.click(saveLayoutButton);

      // ASSERT: Layout saved
      await waitFor(() => {
        expect(
          screen.getByTestId('layout-saved-notification'),
        ).toBeInTheDocument();
      });

      // Step 5: Exit edit mode
      const exitEditButton = screen.getByTestId('exit-edit-mode');
      await user.click(exitEditButton);

      // ASSERT: Edit mode deactivated
      expect(screen.getByTestId('financial-dashboard')).not.toHaveClass(
        'edit-mode',
      );
      expect(screen.queryByTestId('edit-mode-toolbar')).not.toBeInTheDocument();
    });

    it('should handle export data workflow', async () => {
      // TDD RED PHASE: Test data export user workflow

      // ACT: Render dashboard and start export workflow
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // Step 1: Open export menu
      const exportButton = screen.getByTestId('export-data-button');
      await user.click(exportButton);

      // ASSERT: Export menu opened
      expect(screen.getByTestId('export-menu')).toBeInTheDocument();

      // Step 2: Select export options
      await user.click(screen.getByTestId('export-format-pdf'));
      await user.click(screen.getByTestId('export-include-charts'));
      await user.selectOptions(
        screen.getByTestId('export-date-range'),
        'monthly',
      );

      // Step 3: Start export
      const startExportButton = screen.getByTestId('start-export-button');
      await user.click(startExportButton);

      // ASSERT: Export progress shown
      expect(screen.getByTestId('export-progress')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Preparando exportação'),
      ).toBeInTheDocument();

      // Wait for export completion
      await waitFor(
        () => {
          expect(screen.getByTestId('export-complete')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // ASSERT: Download link available
      expect(screen.getByTestId('download-export-link')).toBeInTheDocument();
      expect(
        screen.getByText('Baixar relatório financeiro'),
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design and Mobile Dashboard', () => {
    it('should adapt dashboard layout for mobile screens', () => {
      // TDD RED PHASE: Test mobile responsive behavior

      // ACT: Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: Mobile layout applied
      const dashboard = screen.getByTestId('financial-dashboard');
      expect(dashboard).toHaveClass('mobile-layout');

      // Single column layout for widgets
      expect(dashboard).toHaveStyle({
        gridTemplateColumns: '1fr',
      });

      // Simplified header for mobile
      expect(screen.getByTestId('mobile-dashboard-header')).toBeInTheDocument();

      // Collapsible sidebar
      expect(screen.getByTestId('mobile-sidebar-toggle')).toBeInTheDocument();
    });

    it('should handle touch gestures on mobile', async () => {
      // TDD RED PHASE: Test mobile touch interactions

      // ACT: Set mobile viewport and render
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Swipe to navigate between widget pages
      const dashboard = screen.getByTestId('financial-dashboard');

      // Simulate swipe left
      fireEvent.touchStart(dashboard, {
        touches: [{ clientX: 300, clientY: 300 }],
      });
      fireEvent.touchMove(dashboard, {
        touches: [{ clientX: 100, clientY: 300 }],
      });
      fireEvent.touchEnd(dashboard);

      // ASSERT: Navigation occurred
      expect(screen.getByTestId('dashboard-page-indicator')).toHaveTextContent(
        '2 / 3',
      );

      // Pull-to-refresh gesture
      fireEvent.touchStart(dashboard, {
        touches: [{ clientX: 200, clientY: 50 }],
      });
      fireEvent.touchMove(dashboard, {
        touches: [{ clientX: 200, clientY: 150 }],
      });
      fireEvent.touchEnd(dashboard);

      // ASSERT: Refresh triggered
      expect(screen.getByTestId('pull-refresh-indicator')).toBeInTheDocument();
    });

    it('should optimize performance for mobile devices', async () => {
      // TDD RED PHASE: Test mobile performance optimizations

      // ACT: Set mobile environment
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: { effectiveType: '3g' },
      });

      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: Performance optimizations applied
      const dashboard = screen.getByTestId('financial-dashboard');
      expect(dashboard).toHaveAttribute('data-performance-mode', 'mobile');

      // Reduced animation complexity
      expect(dashboard).toHaveClass('reduced-animations');

      // Lazy loading for non-visible widgets
      expect(
        screen.getByTestId('lazy-loading-placeholder'),
      ).toBeInTheDocument();

      // Wait for visible widgets to load
      await waitFor(() => {
        expect(screen.getByTestId('revenue-widget')).toBeInTheDocument();
      });

      // Hidden widgets should still be lazy
      expect(screen.queryByTestId('metrics-widget')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should meet WCAG 2.1 AA standards across dashboard', async () => {
      // TDD RED PHASE: Test comprehensive dashboard accessibility

      // ACT: Render complete dashboard
      const { container } = render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ASSERT: No accessibility violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Dashboard structure has proper ARIA
      const dashboard = screen.getByTestId('financial-dashboard');
      expect(dashboard).toHaveAttribute('role', 'main');
      expect(dashboard).toHaveAttribute('aria-label', 'Dashboard financeiro');

      // Widgets have proper labeling
      expect(screen.getByTestId('revenue-widget')).toHaveAttribute(
        'role',
        'region',
      );
      expect(screen.getByTestId('revenue-widget')).toHaveAttribute(
        'aria-labelledby',
        'revenue-widget-title',
      );
    });

    it('should support comprehensive keyboard navigation', async () => {
      // TDD RED PHASE: Test keyboard navigation across dashboard

      // ACT: Render dashboard
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Navigate using keyboard
      await user.tab(); // Focus first widget
      expect(screen.getByTestId('revenue-widget')).toHaveFocus();

      await user.tab(); // Move to next widget
      expect(screen.getByTestId('expense-widget')).toHaveFocus();

      // Arrow key navigation within widgets
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('expense-details-button')).toHaveFocus();

      // Enter to activate
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('expense-details-modal')).toBeInTheDocument();

      // Escape to close
      await user.keyboard('{Escape}');
      expect(
        screen.queryByTestId('expense-details-modal'),
      ).not.toBeInTheDocument();
    });

    it('should provide screen reader support for data visualization', () => {
      // TDD RED PHASE: Test screen reader accessibility for charts and data

      // ACT: Render dashboard with data visualizations
      render(
        <FinancialDashboardProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: Charts have screen reader descriptions
      const trendsChart = screen.getByTestId('trends-chart-widget');
      expect(trendsChart).toHaveAttribute(
        'aria-describedby',
        'trends-chart-description',
      );

      const chartDescription = screen.getByTestId('trends-chart-description');
      expect(chartDescription).toHaveClass('sr-only');
      expect(chartDescription).toHaveTextContent(
        /gráfico de linha mostrando tendências/i,
      );

      // Data tables as chart alternatives
      expect(screen.getByTestId('trends-chart-data-table')).toBeInTheDocument();
      expect(screen.getByTestId('trends-chart-data-table')).toHaveClass(
        'sr-only',
      );

      // Live region for dynamic updates
      expect(screen.getByTestId('dashboard-live-region')).toHaveAttribute(
        'aria-live',
        'polite',
      );
    });

    it('should support high contrast and custom themes', () => {
      // TDD RED PHASE: Test accessibility theme support

      // ACT: Render dashboard with high contrast theme
      render(
        <FinancialDashboardProvider clinicId='clinic-123' theme='high-contrast'>
          <FinancialDashboard />
        </FinancialDashboardProvider>,
      );

      // ASSERT: High contrast theme applied
      const dashboard = screen.getByTestId('financial-dashboard');
      expect(dashboard).toHaveClass('theme-high-contrast');

      // Color contrast meets standards
      const revenueWidget = screen.getByTestId('revenue-widget');
      expect(revenueWidget).toHaveStyle({
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '2px solid #ffffff',
      });

      // Charts adapted for high contrast
      const trendsChart = screen.getByTestId('trends-chart');
      expect(trendsChart).toHaveClass('high-contrast-chart');
    });
  });
});
