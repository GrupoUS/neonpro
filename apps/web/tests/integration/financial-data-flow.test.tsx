/**
 * Integration Test: Financial Data Flow
 * TDD RED PHASE: These tests MUST FAIL initially
 *
 * Test Coverage:
 * - End-to-end financial data processing (UI → API → Database → UI)
 * - API integration between frontend and backend financial services
 * - Database operations and data persistence
 * - Data validation and transformation workflows
 * - Error handling and retry mechanisms
 * - Data caching and performance optimization
 * - Real-time data updates and synchronization
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Import components and services that don't exist yet (TDD RED)
import { FinancialDashboard } from '../../src/components/financial/FinancialDashboard';
import { FinancialDataProvider } from '../../src/providers/FinancialDataProvider';
import { financialApiService } from '../../src/services/financial-api-service';
import { financialCacheService } from '../../src/services/financial-cache-service';
import { financialValidationService } from '../../src/services/financial-validation-service';

// Import types that don't exist yet (TDD RED)
import type {
  ApiResponse,
  CacheConfig,
  DataFlowConfig,
  FinancialData,
  FinancialMetrics,
  FinancialReport,
  FinancialTransaction,
  ValidationRules,
} from '../../src/types/financial-integration';

// Import test utilities
import {
  createMockFinancialData,
  createMockFinancialMetrics,
  createMockTransactions,
  setupFinancialTestEnvironment,
  teardownFinancialTestEnvironment,
} from '../utils/financial-test-utils';

describe('Integration: Financial Data Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockServer: ReturnType<typeof setupServer>;

  // Mock financial data for testing
  const mockFinancialData: FinancialData = {
    id: 'fd-001',
    clinicId: 'clinic-123',
    revenue: {
      monthly: 125000,
      quarterly: 375000,
      yearly: 1500000,
      growth: 15.2,
    },
    expenses: {
      monthly: 85000,
      quarterly: 255000,
      yearly: 1020000,
      categories: {
        salaries: 45000,
        equipment: 15000,
        utilities: 8000,
        supplies: 12000,
        other: 5000,
      },
    },
    profit: {
      monthly: 40000,
      quarterly: 120000,
      yearly: 480000,
      margin: 32.0,
    },
    transactions: [
      {
        id: 'tx-001',
        type: 'revenue',
        amount: 2500,
        description: 'Consulta médica',
        date: '2024-01-15T10:30:00Z',
        category: 'consultation',
        patientId: 'patient-001',
      },
      {
        id: 'tx-002',
        type: 'expense',
        amount: 800,
        description: 'Material cirúrgico',
        date: '2024-01-15T14:20:00Z',
        category: 'supplies',
        vendor: 'MedSupply Inc',
      },
    ],
    lastUpdated: '2024-01-15T15:00:00Z',
    syncStatus: 'synchronized',
  };

  const mockMetrics: FinancialMetrics = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    netProfit: 40000,
    profitMargin: 32.0,
    revenueGrowth: 15.2,
    expenseRatio: 68.0,
    averageTransactionValue: 1650,
    transactionCount: 152,
    topRevenueCategories: [
      { category: 'consultation', amount: 95000, percentage: 76.0 },
      { category: 'procedure', amount: 25000, percentage: 20.0 },
      { category: 'other', amount: 5000, percentage: 4.0 },
    ],
    monthlyTrends: [
      { month: 'Nov', revenue: 120000, expenses: 82000, profit: 38000 },
      { month: 'Dec', revenue: 118000, expenses: 80000, profit: 38000 },
      { month: 'Jan', revenue: 125000, expenses: 85000, profit: 40000 },
    ],
  };

  beforeAll(async () => {
    // Setup test environment
    await setupFinancialTestEnvironment();

    // Setup mock server for API integration tests
    mockServer = setupServer(
      // Financial data endpoints
      http.get('/api/v1/financial/data/:clinicId', ({ params }) => {
        const { clinicId } = params;
        return HttpResponse.json({
          success: true,
          data: { ...mockFinancialData, clinicId },
          timestamp: new Date().toISOString(),
        });
      }),
      http.post('/api/v1/financial/data/:clinicId', async ({ request }) => {
        const body = (await request.json()) as FinancialData;
        return HttpResponse.json({
          success: true,
          data: {
            ...body,
            id: 'fd-new',
            lastUpdated: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }),
      // Financial metrics endpoints
      http.get('/api/v1/financial/metrics/:clinicId', ({ params }) => {
        const { clinicId } = params;
        return HttpResponse.json({
          success: true,
          data: mockMetrics,
          timestamp: new Date().toISOString(),
        });
      }),
      // Transaction endpoints
      http.get(
        '/api/v1/financial/transactions/:clinicId',
        ({ params, request }) => {
          const url = new URL(request.url);
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = parseInt(url.searchParams.get('offset') || '0');

          return HttpResponse.json({
            success: true,
            data: {
              transactions: mockFinancialData.transactions.slice(
                offset,
                offset + limit,
              ),
              total: mockFinancialData.transactions.length,
              hasMore: offset + limit < mockFinancialData.transactions.length,
            },
            timestamp: new Date().toISOString(),
          });
        },
      ),
      http.post(
        '/api/v1/financial/transactions/:clinicId',
        async ({ request }) => {
          const transaction = (await request.json()) as FinancialTransaction;
          return HttpResponse.json({
            success: true,
            data: {
              ...transaction,
              id: 'tx-new',
              date: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });
        },
      ),
      // Error simulation endpoints
      http.get('/api/v1/financial/data/error-clinic', () => {
        return HttpResponse.json(
          { success: false, error: 'Database connection failed' },
          { status: 500 },
        );
      }),
      http.get('/api/v1/financial/data/timeout-clinic', () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(
              HttpResponse.json({ success: true, data: mockFinancialData }),
            );
          }, 5000); // Simulate timeout
        });
      }),
      // Cache validation endpoints
      http.get('/api/v1/financial/cache/status/:clinicId', () => {
        return HttpResponse.json({
          success: true,
          data: {
            cached: true,
            lastUpdated: '2024-01-15T15:00:00Z',
            expiration: '2024-01-15T16:00:00Z',
            hitRate: 85.5,
            size: 1024,
          },
        });
      }),
    );

    mockServer.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(async () => {
    // Cleanup test environment
    await teardownFinancialTestEnvironment();
    mockServer.close();
  });

  beforeEach(() => {
    // Setup user event with realistic delays
    user = userEvent.setup({ delay: null });

    // Clear all caches before each test
    financialCacheService.clear();

    // Reset API service state
    financialApiService.reset();

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('End-to-End Data Flow (UI → API → Database → UI)', () => {
    it('should complete full data flow for loading financial dashboard', async () => {
      // TDD RED PHASE: Test complete data flow from UI interaction to final display

      // ARRANGE: Setup dashboard component with data provider
      const TestComponent = () => (
        <FinancialDataProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDataProvider>
      );

      // ACT: Render dashboard and trigger data loading
      render(<TestComponent />);

      // Initial loading state should be shown
      expect(
        screen.getByTestId('financial-dashboard-loading'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Carregando dados financeiros'),
      ).toBeInTheDocument();

      // Wait for data to load from API
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('financial-dashboard-loading'),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // ASSERT: Verify complete data flow results

      // 1. Dashboard rendered with data
      expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();

      // 2. Revenue data displayed correctly
      expect(screen.getByTestId('revenue-monthly')).toHaveTextContent(
        'R$ 125.000',
      );
      expect(screen.getByTestId('revenue-growth')).toHaveTextContent('15,2%');

      // 3. Expenses data displayed correctly
      expect(screen.getByTestId('expenses-monthly')).toHaveTextContent(
        'R$ 85.000',
      );
      expect(screen.getByTestId('expense-ratio')).toHaveTextContent('68,0%');

      // 4. Profit data displayed correctly
      expect(screen.getByTestId('profit-monthly')).toHaveTextContent(
        'R$ 40.000',
      );
      expect(screen.getByTestId('profit-margin')).toHaveTextContent('32,0%');

      // 5. Transaction list populated
      expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
      expect(screen.getAllByTestId(/transaction-item-/)).toHaveLength(2);

      // 6. Charts rendered with data
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
      expect(screen.getByTestId('expense-chart')).toBeInTheDocument();
      expect(screen.getByTestId('profit-trend-chart')).toBeInTheDocument();
    });

    it('should handle user interactions and update data flow', async () => {
      // TDD RED PHASE: Test interactive data flow updates

      // ARRANGE: Render dashboard with loaded data
      const TestComponent = () => (
        <FinancialDataProvider clinicId='clinic-123'>
          <FinancialDashboard />
        </FinancialDataProvider>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: User changes date range filter
      const dateRangeSelect = screen.getByTestId('date-range-selector');
      await user.selectOptions(dateRangeSelect, 'quarterly');

      // ASSERT: Data reloaded and UI updated
      await waitFor(() => {
        expect(screen.getByTestId('revenue-quarterly')).toHaveTextContent(
          'R$ 375.000',
        );
      });

      // ACT: User adds new transaction
      const addTransactionButton = screen.getByTestId('add-transaction-button');
      await user.click(addTransactionButton);

      // Fill transaction form
      await user.type(screen.getByTestId('transaction-amount'), '1500');
      await user.type(
        screen.getByTestId('transaction-description'),
        'Nova consulta',
      );
      await user.selectOptions(
        screen.getByTestId('transaction-category'),
        'consultation',
      );

      const saveButton = screen.getByTestId('save-transaction-button');
      await user.click(saveButton);

      // ASSERT: New transaction appears in list and metrics updated
      await waitFor(() => {
        expect(screen.getAllByTestId(/transaction-item-/)).toHaveLength(3);
        expect(screen.getByText('Nova consulta')).toBeInTheDocument();
      });
    });

    it('should maintain data consistency across multiple components', async () => {
      // TDD RED PHASE: Test data consistency in complex UI state

      // ARRANGE: Render multiple financial components sharing same data
      const TestComponent = () => (
        <FinancialDataProvider clinicId='clinic-123'>
          <div>
            <FinancialDashboard />
            <FinancialMetricsWidget />
            <FinancialTransactionList />
            <FinancialReportsPanel />
          </div>
        </FinancialDataProvider>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Update financial data in one component
      const editRevenueButton = screen.getByTestId('edit-revenue-button');
      await user.click(editRevenueButton);

      await user.clear(screen.getByTestId('revenue-input'));
      await user.type(screen.getByTestId('revenue-input'), '130000');

      const saveRevenueButton = screen.getByTestId('save-revenue-button');
      await user.click(saveRevenueButton);

      // ASSERT: All components reflect the updated data
      await waitFor(() => {
        // Dashboard updated
        expect(screen.getByTestId('revenue-monthly')).toHaveTextContent(
          'R$ 130.000',
        );

        // Metrics widget updated
        expect(screen.getByTestId('metrics-total-revenue')).toHaveTextContent(
          'R$ 130.000',
        );

        // Reports panel updated with recalculated values
        expect(screen.getByTestId('report-profit-margin')).toHaveTextContent(
          '34,6%',
        ); // (130000-85000)/130000
      });
    });
  });

  describe('API Integration and Service Layer', () => {
    it('should handle API service integration correctly', async () => {
      // TDD RED PHASE: Test direct API service integration

      // ACT: Call financial API service directly
      const result = await financialApiService.getFinancialData('clinic-123');

      // ASSERT: API service returns expected data structure
      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          clinicId: 'clinic-123',
          revenue: expect.objectContaining({
            monthly: expect.any(Number),
            growth: expect.any(Number),
          }),
          expenses: expect.objectContaining({
            monthly: expect.any(Number),
            categories: expect.any(Object),
          }),
          profit: expect.objectContaining({
            monthly: expect.any(Number),
            margin: expect.any(Number),
          }),
        }),
      );
    });

    it('should handle API batch operations correctly', async () => {
      // TDD RED PHASE: Test batch API operations

      // ACT: Perform batch transaction creation
      const transactions: FinancialTransaction[] = [
        {
          type: 'revenue',
          amount: 2000,
          description: 'Consulta 1',
          category: 'consultation',
          patientId: 'patient-001',
        },
        {
          type: 'revenue',
          amount: 1500,
          description: 'Consulta 2',
          category: 'consultation',
          patientId: 'patient-002',
        },
        {
          type: 'expense',
          amount: 500,
          description: 'Material médico',
          category: 'supplies',
        },
      ];

      const batchResult = await financialApiService.createTransactionsBatch(
        'clinic-123',
        transactions,
      );

      // ASSERT: Batch operation successful
      expect(batchResult.success).toBe(true);
      expect(batchResult.data.created).toHaveLength(3);
      expect(batchResult.data.failed).toHaveLength(0);

      // Verify each transaction has ID assigned
      batchResult.data.created.forEach(transaction => {
        expect(transaction.id).toBeDefined();
        expect(transaction.date).toBeDefined();
      });
    });

    it('should handle API pagination correctly', async () => {
      // TDD RED PHASE: Test API pagination

      // ACT: Fetch paginated transactions
      const page1 = await financialApiService.getTransactions('clinic-123', {
        limit: 1,
        offset: 0,
      });
      const page2 = await financialApiService.getTransactions('clinic-123', {
        limit: 1,
        offset: 1,
      });

      // ASSERT: Pagination working correctly
      expect(page1.success).toBe(true);
      expect(page1.data.transactions).toHaveLength(1);
      expect(page1.data.hasMore).toBe(true);
      expect(page1.data.total).toBe(2);

      expect(page2.success).toBe(true);
      expect(page2.data.transactions).toHaveLength(1);
      expect(page2.data.hasMore).toBe(false);

      // Verify different transactions returned
      expect(page1.data.transactions[0].id).not.toBe(
        page2.data.transactions[0].id,
      );
    });

    it('should handle API service timeout and retry logic', async () => {
      // TDD RED PHASE: Test timeout and retry mechanisms

      // ACT: Call API with timeout scenario
      const timeoutPromise = financialApiService.getFinancialData('timeout-clinic');

      // ASSERT: Timeout handled appropriately
      await expect(timeoutPromise).rejects.toThrow('Request timeout');

      // Verify retry attempts were made
      expect(financialApiService.getLastRetryCount()).toBe(3);
    });
  });

  describe('Database Operations and Data Persistence', () => {
    it('should persist financial data correctly to database', async () => {
      // TDD RED PHASE: Test database persistence

      // ARRANGE: Create new financial data
      const newFinancialData: Partial<FinancialData> = {
        clinicId: 'clinic-new',
        revenue: {
          monthly: 95000,
          quarterly: 285000,
          yearly: 1140000,
          growth: 8.5,
        },
        expenses: {
          monthly: 65000,
          quarterly: 195000,
          yearly: 780000,
          categories: {},
        },
        profit: {
          monthly: 30000,
          quarterly: 90000,
          yearly: 360000,
          margin: 31.6,
        },
      };

      // ACT: Save data to database via API
      const saveResult = await financialApiService.saveFinancialData(
        'clinic-new',
        newFinancialData,
      );

      // ASSERT: Data saved successfully
      expect(saveResult.success).toBe(true);
      expect(saveResult.data.id).toBeDefined();
      expect(saveResult.data.lastUpdated).toBeDefined();

      // Verify data can be retrieved
      const retrievedData = await financialApiService.getFinancialData('clinic-new');
      expect(retrievedData.success).toBe(true);
      expect(retrievedData.data.clinicId).toBe('clinic-new');
      expect(retrievedData.data.revenue.monthly).toBe(95000);
    });

    it('should handle database transaction rollback on errors', async () => {
      // TDD RED PHASE: Test transaction rollback mechanisms

      // ARRANGE: Create data that will cause validation error
      const invalidData = {
        clinicId: 'clinic-123',
        revenue: { monthly: -5000 }, // Invalid negative revenue
        expenses: { monthly: 85000 },
      };

      // ACT: Attempt to save invalid data
      const saveResult = await financialApiService.saveFinancialData(
        'clinic-123',
        invalidData,
      );

      // ASSERT: Save operation failed with validation error
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('validation');

      // Verify original data unchanged
      const originalData = await financialApiService.getFinancialData('clinic-123');
      expect(originalData.success).toBe(true);
      expect(originalData.data.revenue.monthly).toBe(125000); // Original value preserved
    });

    it('should handle concurrent database updates correctly', async () => {
      // TDD RED PHASE: Test concurrent update handling

      // ARRANGE: Simulate concurrent updates to same financial data
      const update1 = financialApiService.updateRevenue('clinic-123', 130000);
      const update2 = financialApiService.updateRevenue('clinic-123', 135000);

      // ACT: Execute concurrent updates
      const results = await Promise.allSettled([update1, update2]);

      // ASSERT: One update succeeds, other handles conflict
      const successes = results.filter(r => r.status === 'fulfilled');
      const conflicts = results.filter(r => r.status === 'rejected');

      expect(successes).toHaveLength(1);
      expect(conflicts).toHaveLength(1);

      // Verify final state is consistent
      const finalData = await financialApiService.getFinancialData('clinic-123');
      expect(finalData.success).toBe(true);
      expect([130000, 135000]).toContain(finalData.data.revenue.monthly);
    });
  });

  describe('Data Validation and Transformation', () => {
    it('should validate financial data at API boundary', async () => {
      // TDD RED PHASE: Test data validation

      // ARRANGE: Create invalid financial data
      const invalidData = {
        clinicId: '', // Empty clinic ID
        revenue: { monthly: 'invalid' }, // Invalid type
        expenses: { monthly: -1000 }, // Negative expenses
      };

      // ACT: Attempt to save invalid data
      const result = await financialApiService.saveFinancialData(
        'clinic-123',
        invalidData,
      );

      // ASSERT: Validation errors returned
      expect(result.success).toBe(false);
      expect(result.errors).toContain('clinicId is required');
      expect(result.errors).toContain(
        'revenue.monthly must be a positive number',
      );
      expect(result.errors).toContain('expenses.monthly cannot be negative');
    });

    it('should transform currency data correctly', async () => {
      // TDD RED PHASE: Test currency transformation

      // ARRANGE: Financial data with different currency formats
      const dataWithCurrencies = {
        revenue: { monthly: 125000.5 },
        expenses: { monthly: 84999.99 },
        transactions: [
          { amount: 2500.75, currency: 'BRL' },
          { amount: 500.0, currency: 'USD', exchangeRate: 5.2 },
        ],
      };

      // ACT: Process data through transformation service
      const transformedData = await financialValidationService.transformCurrencyData(
        dataWithCurrencies,
      );

      // ASSERT: Currency transformed correctly
      expect(transformedData.revenue.monthly).toBe(125000.5);
      expect(transformedData.transactions[0].amountBRL).toBe(2500.75);
      expect(transformedData.transactions[1].amountBRL).toBe(2600.0); // 500 * 5.2
    });

    it('should validate business rules for financial operations', async () => {
      // TDD RED PHASE: Test business rule validation

      // ARRANGE: Transaction that violates business rules
      const invalidTransaction = {
        type: 'expense',
        amount: 150000, // Exceeds monthly revenue
        description: 'Large expense',
        category: 'equipment',
      };

      // ACT: Validate transaction against business rules
      const validation = await financialValidationService.validateTransaction(
        'clinic-123',
        invalidTransaction,
      );

      // ASSERT: Business rule violations detected
      expect(validation.valid).toBe(false);
      expect(validation.warnings).toContain('Expense exceeds monthly revenue');
      expect(validation.requiresApproval).toBe(true);
      expect(validation.approvalLevel).toBe('manager');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API server errors gracefully', async () => {
      // TDD RED PHASE: Test error handling

      // ACT: Call API endpoint that returns server error
      const result = await financialApiService.getFinancialData('error-clinic');

      // ASSERT: Error handled appropriately
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(result.statusCode).toBe(500);

      // Verify error recovery mechanisms activated
      expect(financialApiService.isInFallbackMode()).toBe(true);
    });

    it('should implement circuit breaker pattern for resilience', async () => {
      // TDD RED PHASE: Test circuit breaker implementation

      // ARRANGE: Simulate multiple failures to trip circuit breaker
      const failingCalls = Array(6)
        .fill(null)
        .map(() => financialApiService.getFinancialData('error-clinic'));

      await Promise.allSettled(failingCalls);

      // ACT: Make another call after circuit breaker should be open
      const circuitBreakerCall = await financialApiService.getFinancialData('clinic-123');

      // ASSERT: Circuit breaker prevents call
      expect(circuitBreakerCall.success).toBe(false);
      expect(circuitBreakerCall.error).toContain('Circuit breaker open');

      // Verify circuit breaker state
      expect(financialApiService.getCircuitBreakerState()).toBe('open');
    });

    it('should provide fallback data during service outages', async () => {
      // TDD RED PHASE: Test fallback mechanisms

      // ARRANGE: Setup fallback data in cache
      await financialCacheService.setFallbackData(
        'clinic-123',
        mockFinancialData,
      );

      // ACT: Request data when service is down
      const result = await financialApiService.getFinancialDataWithFallback('error-clinic');

      // ASSERT: Fallback data returned
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFinancialData);
      expect(result.source).toBe('fallback');
      expect(result.warning).toContain('Using cached fallback data');
    });
  });

  describe('Performance and Caching', () => {
    it('should cache financial data for performance optimization', async () => {
      // TDD RED PHASE: Test caching mechanisms

      // ACT: Load data twice to test caching
      const firstLoad = await financialApiService.getFinancialData('clinic-123');
      const secondLoad = await financialApiService.getFinancialData('clinic-123');

      // ASSERT: Second load served from cache
      expect(firstLoad.success).toBe(true);
      expect(secondLoad.success).toBe(true);
      expect(secondLoad.source).toBe('cache');
      expect(secondLoad.loadTime).toBeLessThan(firstLoad.loadTime);

      // Verify cache statistics
      const cacheStats = await financialCacheService.getStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0);
      expect(cacheStats.totalHits).toBe(1);
    });

    it('should invalidate cache when data is updated', async () => {
      // TDD RED PHASE: Test cache invalidation

      // ARRANGE: Load data to populate cache
      await financialApiService.getFinancialData('clinic-123');

      // ACT: Update financial data
      await financialApiService.updateRevenue('clinic-123', 140000);

      // Load data again
      const updatedLoad = await financialApiService.getFinancialData('clinic-123');

      // ASSERT: Cache was invalidated and fresh data loaded
      expect(updatedLoad.source).toBe('api');
      expect(updatedLoad.data.revenue.monthly).toBe(140000);
    });

    it('should implement cache warming strategies', async () => {
      // TDD RED PHASE: Test cache warming

      // ACT: Trigger cache warming for clinic
      await financialCacheService.warmCache('clinic-123');

      // ASSERT: Cache populated with expected data
      const cacheStatus = await financialCacheService.getCacheStatus('clinic-123');
      expect(cacheStatus.warmed).toBe(true);
      expect(cacheStatus.items).toContain('financial-data');
      expect(cacheStatus.items).toContain('financial-metrics');
      expect(cacheStatus.items).toContain('recent-transactions');
    });

    it('should measure and optimize query performance', async () => {
      // TDD RED PHASE: Test performance measurement

      // ACT: Execute complex financial query with performance tracking
      const startTime = performance.now();
      const result = await financialApiService.getComplexFinancialReport(
        'clinic-123',
        {
          includeMetrics: true,
          includeTransactions: true,
          includeTrends: true,
          dateRange: '12_months',
        },
      );
      const endTime = performance.now();

      // ASSERT: Performance within acceptable limits
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // < 1 second

      // Verify query optimization applied
      expect(result.queryStats.indexesUsed).toBeGreaterThan(0);
      expect(result.queryStats.optimized).toBe(true);
    });
  });

  describe('Real-time Updates and Synchronization', () => {
    it('should handle real-time financial data updates', async () => {
      // TDD RED PHASE: Test real-time synchronization

      // ARRANGE: Setup real-time listener
      const updates: FinancialData[] = [];
      const unsubscribe = financialApiService.subscribeToUpdates(
        'clinic-123',
        data => {
          updates.push(data);
        },
      );

      // Render component that displays real-time data
      render(
        <FinancialDataProvider clinicId='clinic-123' realTimeUpdates={true}>
          <FinancialDashboard />
        </FinancialDataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('financial-dashboard')).toBeInTheDocument();
      });

      // ACT: Simulate external data update
      await financialApiService.simulateExternalUpdate('clinic-123', {
        revenue: { monthly: 128000 },
        lastUpdated: new Date().toISOString(),
      });

      // ASSERT: Real-time update received and UI updated
      await waitFor(() => {
        expect(updates).toHaveLength(1);
        expect(screen.getByTestId('revenue-monthly')).toHaveTextContent(
          'R$ 128.000',
        );
      });

      // Cleanup
      unsubscribe();
    });

    it('should handle offline/online synchronization', async () => {
      // TDD RED PHASE: Test offline sync capabilities

      // ARRANGE: Setup offline mode
      financialApiService.setOfflineMode(true);

      // ACT: Make changes while offline
      const offlineResult = await financialApiService.updateRevenue(
        'clinic-123',
        145000,
      );

      // ASSERT: Changes queued for synchronization
      expect(offlineResult.success).toBe(true);
      expect(offlineResult.queued).toBe(true);

      const pendingSync = await financialApiService.getPendingSyncItems();
      expect(pendingSync).toHaveLength(1);
      expect(pendingSync[0].operation).toBe('updateRevenue');

      // ACT: Go back online and sync
      financialApiService.setOfflineMode(false);
      const syncResult = await financialApiService.syncPendingChanges();

      // ASSERT: Offline changes synchronized
      expect(syncResult.success).toBe(true);
      expect(syncResult.synced).toBe(1);
      expect(syncResult.failed).toBe(0);
    });

    it('should resolve data conflicts during synchronization', async () => {
      // TDD RED PHASE: Test conflict resolution

      // ARRANGE: Create conflicting data states
      const localData = {
        revenue: { monthly: 135000 },
        lastUpdated: '2024-01-15T14:00:00Z',
      };
      const serverData = {
        revenue: { monthly: 140000 },
        lastUpdated: '2024-01-15T15:00:00Z',
      };

      // ACT: Trigger conflict resolution
      const resolution = await financialApiService.resolveDataConflict(
        'clinic-123',
        localData,
        serverData,
      );

      // ASSERT: Conflict resolved using latest timestamp
      expect(resolution.resolved).toBe(true);
      expect(resolution.strategy).toBe('last-write-wins');
      expect(resolution.resolvedData.revenue.monthly).toBe(140000);
      expect(resolution.conflictItems).toContain('revenue.monthly');
    });
  });
});
